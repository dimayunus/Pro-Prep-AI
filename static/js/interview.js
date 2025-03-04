
let currentQuestionIndex = 0;
let selectedQuestions = [];
let stream = null;

// Screen navigation functions
function showUploadScreen() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('upload-screen').classList.remove('hidden');
}

async function startInterview() {
  const resumeFile = document.getElementById('resume').files[0];
  const questionCount = document.getElementById('questionCount').value;

  if (!resumeFile) {
      alert('Please upload your resume first');
      return;
  }

  if (resumeFile.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
  }

  try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('questionCount', questionCount);

      // Upload resume and get questions
      const response = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData
      });
      console.log(response)
      const data = await response.json();
      console.log(data)
      if (response.ok) {
          // Get the generated questions
          console.log(data)
          selectedQuestions = data.questions.questions;
          console.log("selectedQuestions: ",selectedQuestions)
          // If we have fewer questions than requested, add some general questions
          const generalQuestions = [
              "Tell me about yourself.",
              "What are your greatest strengths?",
              "Where do you see yourself in 5 years?",
              "Why should we hire you?",
              "What is your biggest weakness?",
              "Why do you want to work here?",
              "Describe a challenging situation and how you handled it.",
              "What are your salary expectations?",
              "Do you have any questions for us?",
              "What motivates you?"
          ];

          while (selectedQuestions.length < questionCount) {
              const randomQuestion = generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
              if (!selectedQuestions.includes(randomQuestion)) {
                  selectedQuestions.push(randomQuestion);
              }
          }

          // Randomize question order and limit to requested count
          selectedQuestions = selectedQuestions
              .sort(() => 0.5 - Math.random())
              .slice(0, questionCount);

          // Show interview screen
          document.getElementById('upload-screen').classList.add('hidden');
          document.getElementById('interview-screen').classList.remove('hidden');
          
          // Start camera
          startCamera();
          // Show first question
          showQuestion();
      } else {
          alert(data.error || 'Error processing resume');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Error processing resume. Please try again.');
  }
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
  // Save interview data and redirect to results
  sessionStorage.setItem('userName', 'CANDIDATE NAME');
  // window.location.href = 'results.html';

    // Redirect to the results API endpoint
    window.location.href = '/results'; 
}

// Question count slider
const questionCount = document.getElementById('questionCount');
const questionCountValue = document.getElementById('questionCountValue');
if (questionCount && questionCountValue) {
  questionCount.addEventListener('input', function() {
      questionCountValue.textContent = this.value;
  });
}
