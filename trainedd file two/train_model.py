import pandas as pd
import numpy as np
from collections import defaultdict
import math
import joblib
from sklearn.feature_extraction.text import CountVectorizer
# csv files loaded
data = pd.read_csv("symptoms_data.csv", encoding="latin1")

# define smtpoms
data['symptoms'] = data['symptoms'].str.strip().str.lower()
X = data['symptoms']
y = data['department']

# countvectorizer for symptoms 
vectorizer = CountVectorizer()
X_vec = vectorizer.fit_transform(X)

joblib.dump(vectorizer, "vectorizer.pkl")
print("Vectorizer saved as vectorizer.pkl")

# Get the vocabulary 
vocabulary = vectorizer.get_feature_names_out()

# formula of tf idf
from sklearn.feature_extraction.text import TfidfTransformer
tfidf_transformer = TfidfTransformer()
X_tfidf = tfidf_transformer.fit_transform(X_vec)

# tfidf to dense format
X_tfidf_dense = X_tfidf.toarray()

# naive naive baes ko formula
class MultinomialNaiveBayes:
    def __init__(self):
        self.class_priors = {}
        self.word_probs = {}

    def fit(self, X, y):
        class_docs = defaultdict(list)
        for features, label in zip(X, y):
            class_docs[label].append(features)

        total_docs = len(y)
        self.class_priors = {label: len(class_docs[label]) / total_docs for label in class_docs}

        self.word_probs = {}
        for label, docs in class_docs.items():
            word_counts = np.sum(docs, axis=0)
            total_count = np.sum(word_counts)
            self.word_probs[label] = (word_counts + 1) / (total_count + len(vocabulary))

    def predict(self, X):
        predictions = []
        for features in X:
            class_scores = {}
            for label in self.class_priors:
                prior = self.class_priors[label]
                likelihood = np.sum(np.log(self.word_probs[label]) * features)
                class_scores[label] = np.log(prior) + likelihood
            predictions.append(max(class_scores, key=class_scores.get))
        return predictions


nb = MultinomialNaiveBayes()
nb.fit(X_tfidf_dense, y)

joblib.dump(nb, "symptom_classifier.pkl")
print("Model trained and saved as symptom_classifier.pkl")

department_to_tests = data.groupby('department')['recommended_tests'].apply(lambda x: list(set(x))).to_dict()
joblib.dump(department_to_tests, "department_to_tests.pkl")

symptom_to_tests = data.groupby('symptoms')['recommended_tests'].apply(list).to_dict()
joblib.dump(symptom_to_tests, "symptom_to_tests.pkl")

print("Mappings saved: department_to_tests.pkl and symptom_to_tests.pkl")
