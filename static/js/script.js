// Form handling functions
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            window.location.href = data.redirect;
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const formData = {
        fullname: form.querySelector('input[placeholder="Full Name"]').value,
        dob: form.querySelector('input[type="date"]').value,
        email: form.querySelector('input[type="email"]').value,
        username: form.querySelector('input[placeholder="Username"]').value,
        password: form.querySelector('input[placeholder="Password"]').value,
        confirmPassword: form.querySelector('input[placeholder="Confirm Password"]').value
    };

    if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}
