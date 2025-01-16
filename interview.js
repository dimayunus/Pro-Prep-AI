// Sample interview questions
const sampleQuestions = [
  "Tell me about yourself.",
  "What are your greatest strengths?",
  "Where do you see yourself in 5 years?",
  "Why should we hire you?",
  "What is your biggest weakness?",
  "Why do you want to work here?",
  "Describe a challenging situation at work and how you handled it.",
  "What are your salary expectations?",
  "Do you have any questions for us?",
  "What motivates you?",
  "How do you handle stress and pressure?",
  "What are your hobbies?"
];

let currentQuestionIndex = 0;
let selectedQuestions = [];
let stream = null;

// Screen navigation functions
function showUploadScreen() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('upload-screen').classList.remove('hidden');
}

function startInterview() {
  const questionCount = document.getElementById('questionCount').value;
  // Randomly select questions based on user's chosen count
  selectedQuestions = [...sampleQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, questionCount);
  
  document.getElementById('upload-screen').classList.add('hidden');
  document.getElementById('interview-screen').classList.remove('hidden');
  
  // Start camera
  startCamera();
  // Show first question
  showQuestion();
}

// Camera handling
async function startCamera() {
  try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.getElementById('videoElement');
      videoElement.srcObject = stream;
  } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
  }
}

function stopCamera() {
  if (stream) {
      stream.getTracks().forEach(track => track.stop());
  }
}

// Question handling
function showQuestion() {
  document.getElementById('currentQuestion').textContent = 
      selectedQuestions[currentQuestionIndex];
}

function nextQuestion() {
  if (currentQuestionIndex < selectedQuestions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
  } else {
      endInterview();
  }
}

function endInterview() {
  stopCamera();
  // Save interview data and redirect to results
  sessionStorage.setItem('userName', 'CANDIDATE NAME');
  window.location.href = 'results.html';
}

// Question count slider
const questionCount = document.getElementById('questionCount');
const questionCountValue = document.getElementById('questionCountValue');
if (questionCount && questionCountValue) {
  questionCount.addEventListener('input', function() {
      questionCountValue.textContent = this.value;
  });
}
