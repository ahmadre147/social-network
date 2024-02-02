document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Implement AJAX or Fetch to send login data to the backend
    // Example using Fetch API:
    fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        // Handle the token received, e.g., store it in localStorage
        alert('Login successful'); 
    })
    .catch(error => console.error('Error:', error));
});
