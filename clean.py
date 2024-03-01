import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

df1 = pd.read_csv(r'data\keywords.csv').drop(['Unnamed: 0.1', 'Unnamed: 0'], axis=1)
print(df1.info())

df2 = pd.read_csv(r'data\check3.csv').drop(['Unnamed: 0', 'Rating', 'Title'], axis=1)
print(df2.info())

data = pd.merge(df1, df2, on='TMDB_ID', how='inner')
print(data.info())

data = data.drop(['Genre', 'Genre3'], axis=1)
print(data.info())

data['Genre2'].fillna(value=-1, inplace=True)
print(data.info())

data['Title'] = data['Title'].str.lower()
print(data['Title'].head())
#data.to_csv('final.csv')

# Combine Genre1 and Genre2 into a single feature vector
data['Genres'] = data['Genre1'].astype(str) + ',' + data['Genre2'].astype(str)

# TF-IDF Vectorization for keywords
tfidf_vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf_vectorizer.fit_transform(data['Keywords'])

# Compute cosine similarity matrix
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Save the cosine similarity matrix
joblib.dump(cosine_sim, 'model.pkl')

# Function to get movie recommendations
def get_recommendations(title, cosine_sim=cosine_sim, data=data):
    # Get the index of the movie that matches the title
    idx = data[data['Title'] == title].index[0]

    # Get the pairwise similarity scores of all movies with that movie
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort the movies based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get the top 10 most similar movies
    sim_scores = sim_scores[1:11]

    # Get the movie indices
    movie_indices = [i[0] for i in sim_scores]

    # Get the top 10 similar movies with Title, Keywords, and Poster Link
    similar_movies = data.iloc[movie_indices][['Title', 'Keywords', 'Poster_Link']]

    # Return the top 10 most similar movies
    return similar_movies

# Example usage
recommendations = get_recommendations('the avengers')
print(recommendations)
