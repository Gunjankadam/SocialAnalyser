from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
import gridfs
from bson import ObjectId
import pandas as pd
import praw
import os
from io import BytesIO
from googleapiclient.discovery import build
from dotenv import load_dotenv

# --- Setup ---
load_dotenv()
app = Flask(__name__)
CORS(app)

# MongoDB
mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    raise Exception("❌ MONGODB_URI not found. Make sure it's set in Render environment.")

client = MongoClient(mongo_uri)
db = client["SocialAnalysis"]
fs = gridfs.GridFS(db)

# Collections
user_keys_col = db["user_keys"]
user_history_col = db["user_history"]

# Default API Keys (from .env)
DEFAULT_YOUTUBE_API = os.getenv("YOUTUBE_API_KEY")
DEFAULT_REDDIT_ID = os.getenv("REDDIT_CLIENT_ID")
DEFAULT_REDDIT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
DEFAULT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")
DEFAULT_YOUTUBE_USE_COUNT = 10
DEFAULT_REDDIT_USE_COUNT = 10


# ========== API KEY HANDLING ==========

def get_user_keys(email):
    keys = user_keys_col.find_one({"email": email})
    return keys or {}

def get_youtube_client(email):
    user_keys = get_user_keys(email)
    youtube_api_key = user_keys.get("youtube_api", DEFAULT_YOUTUBE_API)
    youtube_use_count = user_keys.get("youtube_use_count", "unlimited")

    # If "unlimited", treat it as 100000 for comparison
    if youtube_use_count == "unlimited":
        youtube_use_count = 100000  # Treat as infinite (large number)
        youtube_client = build('youtube', 'v3', developerKey=youtube_api_key)
        return youtube_client, youtube_use_count
    else:
        youtube_use_count = int(youtube_use_count)  # Convert to integer if it's a number

        if youtube_use_count > 0:
            # Process the youtube API client initialization
            youtube_client = build('youtube', 'v3', developerKey=youtube_api_key)
            youtube_use_count -= 1  # Decrease the count as it was used
    
            # Update the youtube use count in the database
            user_keys_col.update_one(
                {"email": email},
                {"$set": {"youtube_use_count": youtube_use_count}},
            )
            return youtube_client, youtube_use_count
        else:
            raise Exception("YouTube API usage limit reached. Please refresh or use your own key.")



def get_reddit_client(email):
    # Fetch user API keys from the database
    user_keys = get_user_keys(email)
    reddit_client_id = user_keys.get("reddit_client_id", DEFAULT_REDDIT_ID)
    reddit_client_secret = user_keys.get("reddit_secret", DEFAULT_REDDIT_SECRET)
    reddit_user_agent = user_keys.get("reddit_user_agent", DEFAULT_USER_AGENT)
    reddit_use_count = user_keys.get("reddit_use_count", "unlimited")

    # If reddit_use_count is "unlimited", treat it as 100000 (or another large number)
    if reddit_use_count == "unlimited":
        reddit_use_count = 100000  # Treat "unlimited" as a very large number
        reddit_client = praw.Reddit(
                client_id=reddit_client_id,
                client_secret=reddit_client_secret,
                user_agent=reddit_user_agent
        )
        return reddit_client, reddit_use_count

    else:
        reddit_use_count = int(reddit_use_count)  # Convert it to an integer for comparison
    
        # Check if we still have use left for the Reddit API
        if reddit_use_count > 0:
            # Initialize the Reddit client using PRAW
            reddit_client = praw.Reddit(
                client_id=reddit_client_id,
                client_secret=reddit_client_secret,
                user_agent=reddit_user_agent
            )
            
            # Decrease the usage count as it is being used
            reddit_use_count -= 1
            
            # Update the use count in the database
            user_keys_col.update_one(
                {"email": email},
                {"$set": {"reddit_use_count": reddit_use_count}},
            )
    
            return reddit_client, reddit_use_count
        else:
            raise Exception("Reddit API usage limit reached. Please refresh or use your own key.")




# ========== SAVE API KEY ==========

@app.route('/save-api-key', methods=['POST'])
def save_api_key():
    data = request.json
    email = data.get("email")
    youtube_api = data.get("youtube_api")
    reddit_id = data.get("reddit_client_id")
    reddit_secret = data.get("reddit_secret")
    reddit_agent = data.get("reddit_user_agent")  # ✅ Added user agent field

    if not email:
        return jsonify({"error": "Email required"}), 400

    # Initialize update_data with default values
    update_data = {}

    # Check if the user has provided custom API keys
    if youtube_api:
        update_data["youtube_api"] = youtube_api
        update_data["youtube_use_count"] = "unlimited"  # Set to unlimited if user provides the key

    if reddit_id:
        update_data["reddit_client_id"] = reddit_id
        update_data["reddit_use_count"] = "unlimited"  # Set to unlimited if user provides the key

    if reddit_secret:
        update_data["reddit_secret"] = reddit_secret

    if reddit_agent:
        update_data["reddit_user_agent"] = reddit_agent

    # If no keys are provided by the user, use the default keys and counts
    if not youtube_api:
        update_data["youtube_api"] = DEFAULT_YOUTUBE_API
        update_data["youtube_use_count"] = DEFAULT_YOUTUBE_USE_COUNT  # Default count for YouTube

    if not reddit_id:
        update_data["reddit_client_id"] = DEFAULT_REDDIT_ID
        update_data["reddit_use_count"] = DEFAULT_REDDIT_USE_COUNT  # Default count for Reddit

    # Update or insert the data
    user_keys_col.update_one(
        {"email": email},
        {"$set": update_data},
        upsert=True
    )

    return jsonify({"message": "Keys saved"}), 200


# ========== GET API KEY ==========

@app.route('/save-api-key', methods=['GET'])
def get_api_key():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400

    keys = user_keys_col.find_one({"email": email}, {"_id": 0})
    if keys:
        youtube_use_count = keys.get("youtube_use_count", DEFAULT_YOUTUBE_USE_COUNT)
        reddit_use_count = keys.get("reddit_use_count", DEFAULT_REDDIT_USE_COUNT)
        if youtube_use_count != "Unlimited":
            keys["youtube_use_count"] = youtube_use_count
        else:
            keys["youtube_use_count"] = "Unlimited"
        
        if reddit_use_count != "Unlimited":
            keys["reddit_use_count"] = reddit_use_count
        else:
            keys["reddit_use_count"] = "Unlimited"
    return jsonify(keys or {}), 200


# ========== YOUTUBE SCRAPE ==========
@app.route('/scrape-comments', methods=['GET'])
def scrape_youtube():
    email = request.args.get("email")
    query = request.args.get("query", '')
    raw_ids = request.args.get("video_ids", '')
    search_limit = int(request.args.get("search_limit", 5))
    comment_limit = int(request.args.get("comment_limit", 100))
    
    # Get custom filename or fallback to default
    custom_filename = request.args.get("filename", f"{email}_youtube_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv")

    YOUTUBE, youtube_use_count = get_youtube_client(email)

    video_ids = [v.strip() for v in raw_ids.split(',') if v.strip()]
    if query:
        result = YOUTUBE.search().list(q=query, part="id", maxResults=search_limit, type="video").execute()
        for item in result.get("items", []):
            vid = item["id"]["videoId"]
            if vid not in video_ids:
                video_ids.append(vid)

    if not video_ids:
        return jsonify({"error": "No video IDs found"}), 400

    rows = [["video_id", "author_name", "comment", "published_at", "likes", "reply_count"]]
    for vid in video_ids:
        data = YOUTUBE.commentThreads().list(
            part="snippet", videoId=vid, maxResults=comment_limit, textFormat="plainText"
        ).execute()
        for item in data.get("items", []):
            top = item['snippet']['topLevelComment']['snippet']
            rows.append([vid, top['authorDisplayName'], top['textDisplay'],
                         top['publishedAt'], top['likeCount'], item['snippet']['totalReplyCount']])

    df = pd.DataFrame(rows[1:], columns=rows[0])
    csv_bytes = df.to_csv(index=False).encode()
    
    # Save with the custom or default filename
    blob_id = fs.put(csv_bytes, filename=custom_filename)
    
    # Insert file history in the DB
    user_history_col.insert_one({
        "email": email,
        "platform": "youtube",
        "query": query,
        "csv_blob_id": blob_id
    })

    return jsonify({"status": "success", "blob_id": str(blob_id), "youtube_use_count": youtube_use_count}), 200





# ========== REDDIT SCRAPE ==========
@app.route('/scrape-reddit', methods=['GET'])
def scrape_reddit():
    email = request.args.get("email")
    query = request.args.get("query", '')
    sub_limit = int(request.args.get("sub_limit", 5))
    post_limit = int(request.args.get("post_limit", 5))
    comment_limit = int(request.args.get("comment_limit", 20))

    # Get custom filename or fallback to default
    custom_filename = request.args.get("filename", f"{email}_reddit_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv")

    REDDIT, reddit_use_count = get_reddit_client(email)

    if not query:
        return jsonify({"error": "No query provided"}), 400

    subs = [sr.display_name for sr in REDDIT.subreddits.search(query, limit=sub_limit)]
    posts = []
    for sub in subs:
        for s in REDDIT.subreddit(sub).search(query, limit=post_limit):
            posts.append((s.url, s))

    rows = [["Post URL", "Comment"]]
    for url, post in posts:
        post.comments.replace_more(limit=0)
        for c in post.comments.list()[:comment_limit]:
            rows.append([url, c.body])

    df = pd.DataFrame(rows[1:], columns=rows[0])
    csv_bytes = df.to_csv(index=False).encode()

    # Save with the custom or default filename
    blob_id = fs.put(csv_bytes, filename=custom_filename)

    # Insert file history in the DB
    user_history_col.insert_one({
        "email": email,
        "platform": "reddit",
        "query": query,
        "csv_blob_id": blob_id
    })

    return jsonify({"status": "success", "blob_id": str(blob_id), "reddit_use_count": reddit_use_count}), 200




# In the user-history route, add file size and keyword stats:
@app.route('/user-history', methods=['GET'])
def user_history():
    email = request.args.get("email")
    history = list(user_history_col.find({"email": email}))
    formatted = []
    for item in history:
        blob_id = item["csv_blob_id"]
        blob = fs.get(blob_id)
        uploaded_time = blob.upload_date.strftime("%Y-%m-%d %H:%M:%S")
        file_size = blob.length  # File size in bytes
        keyword_count = get_keyword_count(blob)  # You can define this function based on your needs
        formatted.append({
            "platform": item.get("platform", ""),
            "query": item.get("query", ""),
            "csv_blob_id": str(blob._id),
            "filename": blob.filename,
            "uploaded_at": uploaded_time,
            "file_size": file_size,  # Add file size
            "keyword_count": keyword_count  # Keyword stats
        })
    # Sort by most recent first
    sorted_history = sorted(formatted, key=lambda x: x["uploaded_at"], reverse=True)
    return jsonify({"history": sorted_history}), 200

# Function to get keyword count (example for YouTube comments)
def get_keyword_count(blob):
    content = blob.read().decode('utf-8')  # Read the file
    rows = content.splitlines()
    keywords = ["data", "social", "sentiment"]  # Example keywords
    keyword_count = {keyword: 0 for keyword in keywords}
    
    for row in rows:
        for keyword in keywords:
            if keyword.lower() in row.lower():
                keyword_count[keyword] += 1
    
    return keyword_count


# ========== DOWNLOAD CSV ==========
@app.route('/download-csv/<blob_id>', methods=['GET'])
def download_csv(blob_id):
    try:
        blob = fs.get(ObjectId(blob_id))
        return send_file(BytesIO(blob.read()), download_name=blob.filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/scraped-files', methods=['GET'])
def get_scraped_files():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    history = list(user_history_col.find({"email": email}).sort("upload_time", -1))
    for entry in history:
        entry["_id"] = str(entry["_id"])
        entry["csv_blob_id"] = str(entry["csv_blob_id"])
        entry["upload_time"] = entry["upload_time"].isoformat()
    return jsonify(history), 200

@app.route('/delete-file/<blob_id>', methods=['DELETE'])
def delete_file(blob_id):
    try:
        fs.delete(ObjectId(blob_id))
        user_history_col.delete_one({"csv_blob_id": ObjectId(blob_id)})
        return jsonify({"message": "File deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== Start Server ==========

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))