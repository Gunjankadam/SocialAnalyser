
# SocialAnalyser

SocialAnalyser is a web-based social media analytics platform designed to extract, analyze, and visualize data from social media platforms like YouTube and Reddit. It allows users to gain insights from social media trends, decode sentiment, and visualize key metrics like sentiment distribution, TF-IDF terms, and topic modeling.

## Features

- **File Extract and Data Analysis**: Users can extract social media data (e.g., YouTube and Reddit) in CSV format for analysis.
- **Sentiment Analysis**: Analyze the sentiment of social media content, with visual representations of sentiment distribution.
- **TF-IDF Analysis**: Get the top TF-IDF terms that provide insights into important words within the text data.
- **Topic Modeling**: Identify key topics from the uploaded social media data using unsupervised machine learning techniques.
- **Visualization**: Interactive charts and visualizations, including word clouds, sentiment charts, and topic-based bar charts.
- **Easy to Use**: Simple and intuitive interface for extracting files, starting analyses, and viewing results.


## Installation

### Prerequisites

Before running the project locally, make sure you have:

- Node.js installed (preferably v14 or higher)
- MongoDB (for local development, or use MongoDB Atlas for cloud-based storage)
- Git (to clone the repository)

### Clone the Repository

```bash
git clone https://github.com/your-username/SocialAnalyser.git
cd SocialAnalyser
```
### Navigate to folder

```bash
cd SocialAnalyser
```

### Install Dependencies and build project

```bash
npm install -legacy-peer-deps; npm run build;
```


### Configure Environment Variables

Create a `.env` file and define the necessary environment variables:

```env
MONGODB_URI=""
EMAIL_USER=""
EMAIL_PASS=""
```

### Run the Application

To run both frontend and backend concurrently, run the following commands in terminal windows:

```bash
npm run dev
```

### Run python files from pytthonfiles folder seperately but concurrently

terminal 1
```bash
pip install -r requirements.txt
python main.py
```
terminal 2
```bash
pip install -r requirements.txt
python analysis.py
```

Note - store the required env variables for python file near it
```env
MONGODB_URI=""
YOUTUBE_API_KEY=""
REDDIT_CLIENT_ID =""
REDDIT_CLIENT_SECRET=""
REDDIT_USER_AGENT=""
```

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js (for APIs)
- **Database**: MongoDB (for storing user data and historical analytics)
- **Libraries/Tools**:
  - **Recharts** for data visualization
  - **Next.js** for server-side rendering and routing
  - **React Context API** for global state management
  - **html2canvas** for exporting visualizations as images
  - **TF-IDF** for sentiment and text analysis
  - **Topic modeling (e.g., LDA)** for discovering topics from the dataset
  - **GridFS** (For storing large files)

## Usage

1. **Extract Data**: After logging in, go to the Data Extraction page and extract a CSV file containing the social media data from YouTube or Reddit.
2. **Start Analysis**: Once the file is uploaded, you can start the analysis, which will include sentiment analysis, TF-IDF analysis, and topic modeling.
3. **View Visualizations**: The results of the analysis will be displayed as interactive visualizations on the Visualization page.
4. **Download Report**: You can download the results in a report format (CSV or DOC).

## Screenshots


