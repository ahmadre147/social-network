document.addEventListener('DOMContentLoaded', function () {
    // Call the function to fetch and display posts
    getPosts();
});

function getPosts() {
    // Fetch user ID from localStorage
    const userId = localStorage.getItem('userId');
    console.log(userId);

    // Fetch posts from the backend
    fetch('http://localhost:3000/api/get-posts', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'), // Assume token is stored in localStorage after login
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId }) // Include the user ID in the request body
    })
    .then(response => response.json())
    .then(data => {
        // Assume data is an array of post objects
        const postsContainer = document.getElementById('postsContainer');

        // Clear previous posts
        postsContainer.innerHTML = '';

        // Iterate through posts and append them to the container
        data.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                <p>Posted by: ${post.postedBy.name}</p>
            `;
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error:', error));
}
