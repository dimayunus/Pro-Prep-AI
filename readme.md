
# Overview

This AI-powered interview platform allows users to practice interviews by answering questions in real-time. The system analyzes responses using sentiment analysis, language proficiency, factual accuracy, and confidence levels to provide feedback. It includes automated question generation, voice input support, and detailed performance reports.

# Features

- 🎙️ Voice Based Responses - Users can answer questions using voice input, which is recorded and processed.

- 📊 Sentiment Analysis - Evaluates emotional tone in responses using NLP.

- 🧠 AI-Driven Feedback - Provides scores on confidence, language proficiency, factual accuracy, and sentiment.

- 📈 Performance Metrics - Displays results using sliders and pie charts.

- 🔄 Real-Time Processing - Results are processed and displayed dynamically.

- 🗑️ Auto Cleanup - Deletes audio files after results are stored.

# Tech Stack

- Frontend: HTML, CSS, JavaScript (Chart.js for visualization)

- Backend: Flask (Python)

- Database: SQLite

- Machine Learning/NLP: OpenAI API, Sentiment Analysis

- Audio Processing: WebM format voice recordings


Running the Application

# Start the Flask server
python app.py

The application will be available at http://127.0.0.1:5000.