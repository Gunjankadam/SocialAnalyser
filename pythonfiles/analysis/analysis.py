from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
from bson import ObjectId
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import networkx as nx
from collections import Counter
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import numpy as np
import os
import string
import gridfs
from sklearn.feature_extraction.text import CountVectorizer

# --- Setup ---
app = Flask(__name__)
CORS(app)

# MongoDB setup (no GridFS)
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["SocialAnalysis"]
fs = gridfs.GridFS(db)
user_history_col = db["user_history"]

@app.route('/get-user-files', methods=['GET'])
def get_user_files():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Fetching files uploaded by the user (sorted by latest upload date)
    files = list(user_history_col.find({"email": email}).sort("upload_date", -1))  # Sorting by latest upload date

    formatted_files = []

    for file in files:
        # Assuming that the 'csv_blob_id' is the reference to the file content
        blob_id = file.get("csv_blob_id")
        
        # Ensure blob_id exists and retrieve file data
        if blob_id:
            # Get the file from the database using the blob_id
            blob = fs.get(ObjectId(blob_id))
            
            # Extract file metadata
            uploaded_time = blob.upload_date.strftime("%Y-%m-%d %H:%M:%S")
            file_size = blob.length  # File size in bytes


            formatted_files.append({
                "platform": file.get("platform", ""),
                "query": file.get("query", ""),
                "csv_blob_id": str(blob._id),
                "filename": blob.filename,
                "uploaded_at": uploaded_time,
                "file_size": file_size
            })
        else:
            # If there's no blob_id, log an error or handle it gracefully
            continue

    # Sort by most recent first
    sorted_files = sorted(formatted_files, key=lambda x: x["uploaded_at"], reverse=True)

    return jsonify({"files": sorted_files}), 200


# Convert any numpy types (e.g., int64, float64) to standard Python types (e.g., int, float)
def convert_to_serializable(value):
    if isinstance(value, (np.int64, np.float64)):
        return value.item()  # Convert to native Python type (int or float)
    elif isinstance(value, dict):
        return {k: convert_to_serializable(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [convert_to_serializable(v) for v in value]
    else:
        return value

@app.route('/get-analysis', methods=['GET'])
def get_analysis():
    blob_id = request.args.get("blob_id")
    
    try:
        # Retrieve the file from GridFS using the blob_id
        blob = fs.get(ObjectId(blob_id))  # Use GridFS to get the file
        file_data = blob.read()  # Get the file content

        # Process the CSV into DataFrame
        df = pd.read_csv(BytesIO(file_data))  # Convert the binary content to a CSV DataFrame
        
        # Debug: Print the columns and check which column to use
        print(f"Columns in CSV: {df.columns}")
        
        # List of possible text columns for different platforms (Reddit, YouTube, etc.)
        possible_text_cols = ['text', 'comment', 'Comment', 'body', 'Body', 'message']
        
        # Search for the first matching column (case insensitive)
        text_col = next((col for col in df.columns if col.strip().lower() in [x.lower() for x in possible_text_cols]), None)

        if not text_col:
            return jsonify({"error": "No valid text column found"}), 400
        
        texts = df[text_col].dropna().astype(str).tolist()

        # Sentiment analysis
        sentiments = [TextBlob(t).sentiment.polarity for t in texts]
        sentiment_labels = ['positive' if s > 0.05 else 'negative' if s < -0.05 else 'neutral' for s in sentiments]
        sentiment_counts = Counter(sentiment_labels)

        # TF-IDF
        tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = tfidf_vectorizer.fit_transform(texts)
        tfidf_words = tfidf_vectorizer.get_feature_names_out()
        tfidf_scores = tfidf_matrix.sum(axis=0).A1
        tfidf_data = sorted(zip(tfidf_words, tfidf_scores), key=lambda x: x[1], reverse=True)[:20]

        # Topics
        lda = LatentDirichletAllocation(n_components=5, random_state=42)
        lda.fit(tfidf_matrix)
        topics = []
        for topic in lda.components_:
            top_words = [tfidf_words[i] for i in topic.argsort()[-10:]]
            topics.append(top_words)

        # Co-occurrence graph
        all_words = [word for text in texts for word in text.lower().split() if word.isalpha()]
        common_words = [word for word, _ in Counter(all_words).most_common(100)]
        G = nx.Graph()
        for text in texts:
            words = [w for w in text.lower().split() if w in common_words]
            for i in range(len(words)):
                for j in range(i + 1, len(words)):
                    if G.has_edge(words[i], words[j]):
                        G[words[i]][words[j]]['weight'] += 1
                    else:
                        G.add_edge(words[i], words[j], weight=1)

        centralities = nx.degree_centrality(G)
        centrality_sorted = sorted(centralities.items(), key=lambda x: x[1], reverse=True)[:10]

        network_data = {
            'nodes': [{'id': node} for node in G.nodes()],
            'edges': [{'source': u, 'target': v, 'weight': d['weight']} for u, v, d in G.edges(data=True)]
        }

        # Word cloud image
        wordcloud = WordCloud(width=800, height=400, background_color='white').generate(' '.join(all_words))
        wc_img = BytesIO()
        wordcloud.to_image().save(wc_img, format='PNG')
        wc_img.seek(0)
        wordcloud_base64 = base64.b64encode(wc_img.read()).decode('utf-8')

        # Co-occurrence graph image using spring_layout (pure matplotlib)
        pos = nx.spring_layout(G, seed=42, k=0.5)

        fig, ax = plt.subplots(figsize=(10, 8))
        nx.draw_networkx_nodes(G, pos, node_size=600, node_color='lightblue', ax=ax)
        nx.draw_networkx_edges(G, pos, width=[G[u][v]['weight'] * 0.1 for u, v in G.edges()], alpha=0.6, ax=ax)
        nx.draw_networkx_labels(G, pos, font_size=10, ax=ax)
        ax.set_title(" ", fontsize=14)
        ax.axis('off')

        co_img = BytesIO()
        plt.savefig(co_img, format='PNG', bbox_inches='tight')
        co_img.seek(0)
        cooccurrence_base64 = base64.b64encode(co_img.read()).decode('utf-8')
        co_img.close()
        plt.close()

        result = {
            'sentiments': sentiments,
            'sentiment_summary': dict(sentiment_counts),
            'topics': topics,
            'tfidf': tfidf_data,
            'network': network_data,
            'centralities': centrality_sorted,
            'wordcloud': wordcloud_base64,
            'cooccurrence_img': cooccurrence_base64
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))