from flask import Flask, request, jsonify, render_template, send_from_directory, url_for, session, redirect
from flask_cors import CORS
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import PyPDF2
from resume_analyser import generate_question ,get_results
from openai import OpenAI
client = OpenAI()


app = Flask(__name__) 
CORS(app)


ALLOWED_EXTENSIONS = {'pdf'}

UPLOAD_FOLDER = 'uploads'
DATABASE = 'users.db'
app.secret_key = 'your-secret-key-here'  # Add this line for session management

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Utility to connect to the database
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn
# Initialize the database and create the users table
def init_db():
    with get_db_connection() as conn:
        # Create users table
        conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            dob TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
        ''')

        # Create interview_results table
        conn.execute('''
        CREATE TABLE IF NOT EXISTS interview_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            confidence REAL NOT NULL,
            language REAL NOT NULL,
            factual REAL NOT NULL,
            sentiment_positive REAL NOT NULL,
            sentiment_negative REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        ''')

    print("Database initialized!")

def reset_database():
    with get_db_connection() as conn:
        conn.execute("DROP TABLE IF EXISTS users;")
        conn.execute("DROP TABLE IF EXISTS interview_results;")
        conn.commit()
    print("Database reset! You need to reinitialize it.")



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard', methods=['GET'])
def dashboard():
    return render_template('dashboard.html')

@app.route('/results')
def results():
    return render_template('results.html')

@app.route('/tips')
def tips():
    return render_template('tips.html')

@app.route('/past-scores')
def past_scores():
    return render_template('past-scores.html')




@app.route('/api/user_info')
def get_user_info():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in!"}), 401

    user_id = session['user_id']

    with get_db_connection() as conn:
        user = conn.execute('SELECT fullname FROM users WHERE id = ?', (user_id,)).fetchone()

    if user:
        return jsonify({"fullname": user["fullname"]})
    else:
        return jsonify({"error": "User not found!"}), 404

@app.route('/api/interview_dates')
def get_interview_dates():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in!"}), 401

    user_id = session['user_id']
    
    try:
        with get_db_connection() as conn:
            cursor = conn.execute('''
                SELECT DISTINCT DATE(timestamp) as date, TIME(timestamp) as time 
                FROM interview_results WHERE user_id = ? ORDER BY timestamp DESC
            ''', (user_id,))
            interviews = cursor.fetchall()

        unique_dates = sorted(set(row['date'] for row in interviews), reverse=True)
        date_time_map = {date: [] for date in unique_dates}

        for row in interviews:
            date_time_map[row['date']].append(row['time'])

        return jsonify({"dates": unique_dates, "date_time_map": date_time_map})

    except Exception as e:
        print(f"Error fetching interview dates: {e}")
        return jsonify({"error": "Failed to fetch interview dates"}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not (username and password):
        return jsonify({"error": "Username and password are required!"}), 400
   
    with get_db_connection() as conn:
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']

            return jsonify({"message": "Login successful!", "redirect": url_for('dashboard')}), 200
        else:
            return jsonify({"error": "Invalid username or password!"}), 401


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json

    fullname = data.get('fullname')
    dob = data.get('dob')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')

    # Validate input
    if not (fullname and dob and email and username and password and confirm_password):
        return jsonify({"error": "All fields are required!"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords don't match!"}), 400

    hashed_password = generate_password_hash(password)

    try:
        with get_db_connection() as conn:
            conn.execute('''
            INSERT INTO users (fullname, dob, email, username, password)
            VALUES (?, ?, ?, ?, ?)''', (fullname, dob, email, username, hashed_password))
            
        return jsonify({"message": "Registration successful!"}), 201
    except sqlite3.IntegrityError as e:
        return jsonify({"error": "Username or email already exists!"}), 400



@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['resume']
    question_count = request.form.get('questionCount', type=int)
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if question_count is None:
        return jsonify({'error': 'Question count is required'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        questions = generate_question(filepath,question_count)
        # Clean up the uploaded file
        os.remove(filepath)
        
        return jsonify({'questions': questions}), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    question = request.form.get('question')
    audio = request.files.get('audio')

    if not question or not audio:
        return jsonify({"error": "Missing question or audio"}), 400

    sanitized_question = secure_filename(question)  # Sanitize for file path safety

    # Save the audio file locally (or process it further)
    save_path = os.path.join('./answers', f"{sanitized_question}.webm")
    # Ensure the directory exists
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    audio.save(save_path)
    # Here, you can add code to further process audio, e.g., transcription

    return jsonify({"status": "success", "message": "Answer recorded successfully"}), 200


def get_interview_results():
    answers_dir = './answers'
    if not os.path.exists(answers_dir):
        return jsonify({"error": "No answers found"}), 400

    responses = []
    
    # List all saved audio files
    audio_files = [f for f in os.listdir(answers_dir) if f.endswith('.webm')]
    if not audio_files:
        return jsonify({"error": "No audio files found"}), 400

    for audio_file in audio_files:
        file_path = os.path.join(answers_dir, audio_file)
        
        try:
            # Open the audio file and transcribe it using OpenAI Whisper API
            with open(file_path, "rb") as audio:
                transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                response_format='text'
                )

            
            # Extract the question from the filename (remove file extension)
            question_text = audio_file.replace('.webm', '').replace('_', ' ')

            # Store the result
            responses.append({
                "question": question_text,
                "answer": transcript
            })
           
        except Exception as e:
            print(f"Error processing {audio_file}: {str(e)}")
            continue
    return responses

def delete_audio_files():
    """Deletes all .webm audio files in the answers directory."""
    answers_dir = './answers'
    if not os.path.exists(answers_dir):
        print("No answers directory found. Skipping deletion.")
        return

    try:
        audio_files = [f for f in os.listdir(answers_dir) if f.endswith('.webm')]
        for file in audio_files:
            file_path = os.path.join(answers_dir, file)
            os.remove(file_path)
            print(f"Deleted: {file_path}")
    except Exception as e:
        print("Error deleting audio files:", e)


@app.route('/api/results')
def api_results():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in!"}), 401  # Ensure user is logged in

    user_id = session['user_id']
    responses = get_interview_results()
    result = get_results(response=responses)

    metrics = {
        'confidence': result.get('confidence', 3),
        'languageProficiency': result.get('languageProficiency', 3),
        'factualAccuracy': result.get('factualAccuracy', 3),
        'sentiment': {
            'positive': result.get('sentiment', {}).get('positive', 3),
            'negative': result.get('sentiment', {}).get('negative', 3)
        }
    }

    # Insert the results into the database
    try:
        with get_db_connection() as conn:
            conn.execute('''
                INSERT INTO interview_results 
                (user_id, confidence, language, factual, sentiment_positive, sentiment_negative, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ''', (
                user_id,
                metrics['confidence'],
                metrics['languageProficiency'],
                metrics['factualAccuracy'],
                metrics['sentiment']['positive'],
                metrics['sentiment']['negative']
            ))
        delete_audio_files()
        return jsonify(metrics)  # Send JSON to frontend

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/past_results')
def api_past_results():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in!"}), 401

    user_id = session['user_id']

    with get_db_connection() as conn:
        result = conn.execute('''
            SELECT confidence, language, factual, sentiment_positive, sentiment_negative, timestamp
            FROM interview_results 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 5
        ''', (user_id,)).fetchall()

    if not result:
        return jsonify({"error": "No past results found!"})

    past_scores = [
        {
            "confidence": row["confidence"],
            "languageProficiency": row["language"],
            "factualAccuracy": row["factual"],
            "sentiment": {
                "positive": row["sentiment_positive"],
                "negative": row["sentiment_negative"]
            },
            "timestamp": row["timestamp"]
        } for row in result
    ]

    return jsonify({"past_scores": past_scores})




if __name__ == '__main__':
    # reset_database()
    init_db()
    app.run(debug=True)
