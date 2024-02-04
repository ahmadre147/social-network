document.addEventListener('DOMContentLoaded', function () {
    // Call the function to fetch and display posts
    getPosts();

    // Fetch and display user status
    getUserStatus();

    // Fetch and display follower requests
    getFollowerRequests();

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
                'Authorization': localStorage.getItem('token')
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
                ${post.photo ? `<img src="${post.photo}" alt="Post Image" style="max-width: 100%; height: auto;">` : ''}
                <button class="btn btn-danger" onclick="deletePost('${post._id}')">Delete</button>
            `;
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error:', error));
}


// Function to delete a post
function deletePost(postId) {
    fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed (e.g., show a success message)
        console.log(data.msg);

        // Refresh the posts after deletion
        getPosts();
    })
    .catch(error => console.error('Error:', error));
}

function getFollowerRequests() {
    // Fetch follower requests from the backend
    fetch('http://localhost:3000/api/users/follower-requests', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Assume data is an array of follower request objects
        const followerRequestsContainer = document.getElementById('followerRequestsContainer');

        // Clear previous follower requests
        followerRequestsContainer.innerHTML = '';

        // Iterate through follower requests and append them to the container
        data.forEach(requester => {
            const requestElement = document.createElement('div');
            requestElement.className = 'follower-request';
            requestElement.innerHTML = `
                <img src="${requester.profilePic || './images/default-profile.jpg'}" class="requester-img rounded-circle" alt="Requester Image">
                <p>${requester.name} wants to follow you</p>
                <button class="btn btn-primary btn-sm" onclick="acceptFollowerRequest('${requester._id}')">Accept</button>
                <button class="btn btn-danger btn-sm" onclick="rejectFollowerRequest('${requester._id}')">Reject</button>
            `;
            followerRequestsContainer.appendChild(requestElement);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Function to accept a follower request
// Function to accept a follower request
function acceptFollowerRequest(requesterId) {
    console.log(`requesterId ${requesterId}`);
    fetch(`http://localhost:3000/api/users/accept-follower-request/${requesterId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed (e.g., show a success message)
        console.log(data.msg);

        // You might want to update the UI or perform additional actions after accepting
        // the follower request. For now, we're just logging the message.
    })
    .catch(error => console.error('Error:', error));
}

// Function to reject a follower request
function rejectFollowerRequest(requesterId) {
    fetch(`http://localhost:3000/api/users/reject-follower-request/${requesterId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed (e.g., show a success message)
        console.log(data.msg);

        // You might want to update the UI or perform additional actions after rejecting
        // the follower request. For now, we're just logging the message.
    })
    .catch(error => console.error('Error:', error));
}


// Function to fetch and display user status
function getUserStatus() {
    // Fetch user status from the backend
    fetch('http://localhost:3000/api/users/status', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Assume data is an object with followersCount, followingCount, and postsCount
        const userStatusContainer = document.getElementById('userStatusContainer');

        // Clear previous user status
        userStatusContainer.innerHTML = '';

        // Display user status
        const userStatusElement = document.createElement('div');
        userStatusElement.className = 'user-status';
        userStatusElement.innerHTML = `
            <p>Followers: ${data.followersCount}</p>
            <p>Following: ${data.followingCount}</p>
            <p>Posts: ${data.postsCount}</p>
        `;
        userStatusContainer.appendChild(userStatusElement);
    })
    .catch(error => console.error('Error:', error));
}
