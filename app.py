# Flask app

# Import necessary libraries
from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)

# Load data and model
data = pd.read_csv('final.csv')
cosine_sim = joblib.load('model.pkl')

# Convert all text in the 'Title' column to lowercase
data['Title'] = data['Title'].str.lower()

# Route to render index.html template
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle AJAX requests for movie suggestions
@app.route('/suggestions', methods=['POST'])
def get_suggestions():
    partial_title = request.json['partial_title'].lower()  # Convert partial title to lowercase
    suggestions = data[data['Title'].str.contains(partial_title, case=False)]['Title'].tolist()
    return jsonify({'suggestions': suggestions})

# Route to handle AJAX requests for movie recommendations
@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    movie_title = request.json['movie_title'].lower()  # Convert movie title to lowercase
    if movie_title not in data['Title'].values:
        return jsonify({'message': 'Sorry! We do not have this movie in our database yet or check the spelling'})
    idx = data[data['Title'] == movie_title].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11]
    movie_indices = [i[0] for i in sim_scores]
    recommendations = data.iloc[movie_indices][['Title', 'Poster_Link', 'Plot_Story']]
    return jsonify(recommendations.to_dict(orient='records'))

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
