document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    // Implement AJAX or Fetch to send registration data to the backend
    // Example using Fetch API:
    fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg); // Display a success message
    })
    .catch(error => console.error('Error:', error));
});
