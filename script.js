// Form handling functions
function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  // Add login logic here
  window.location.href = 'interview.html';
}

function handleSignup(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  // Add signup logic here
  window.location.href = 'interview.html';
}

function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}
