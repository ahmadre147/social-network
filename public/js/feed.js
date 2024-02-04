document.addEventListener('DOMContentLoaded', function () {
    // Call the function to fetch and display posts
    getPosts();

    document.getElementById('addPostButton').addEventListener('click', function() {
        // Show the post form when the "Add Post" button is clicked
        document.getElementById('postFormContainer').style.display = 'block';
    });
    
    document.getElementById('cancelPostButton').addEventListener('click', function() {
        // Reset the form and hide it when the "Cancel" button is clicked
        document.getElementById('postForm').reset();
        document.getElementById('postFormContainer').style.display = 'none';
    });
    
    document.getElementById('postForm').addEventListener('submit', function(event) {
        event.preventDefault();
    
        const title = document.getElementById('title').value;
        const body = document.getElementById('body').value;
        const photo = document.getElementById('photo').value;
    
        const postData = {
            title,
            body,
            photo
        };
    
        // Send the post data to the server
        fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the response from the server
    
            // Reset the form and hide it
            document.getElementById('postForm').reset();
            document.getElementById('postFormContainer').style.display = 'none';
    
            // You may also want to update the UI to display the new post
            // For simplicity, we're just logging the data for now
            alert('Post created successfully!');
        })
        .catch(error => console.error('Error:', error));
    });
    
});

function getPosts() {
    console.log("here");
    // Fetch posts from the backend
    fetch('http://localhost:3000/api/get-posts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Assume data is an array of post objects
        console.log("here2");
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
