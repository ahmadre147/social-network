document.addEventListener('DOMContentLoaded', function () {
    // load feed
    loadFeed();
});

function loadFeed() {
    fetch('http://localhost:3000/api/users/feed', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        const feedContainer = document.getElementById('feed');
        const headingContainer = document.getElementById('headingContainer');

        // Clear previous content
        feedContainer.innerHTML = '';

        // Iterate through the feed data and append posts
        data.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'feed-post';
            postEl.innerHTML = `
                <img src="${post.postedBy.profilePic || './images/default-profile.jpg'}" class="profile-pic">
                <h3>${post.postedBy.name}</h3>
                <div class="header">
                    <h2 class="title">${post.title}</h2>
                </div>
                <p class="content">
                    ${post.body}
                </p>
                ${post.photo ? `<img src="${post.photo}" class="post-image">` : ''}
                <div class="post-footer">
                    <div class="likes">${post.likes.length} likes</div>
                    <div class="comments">${post.comments.length} comments</div>
                    <button class="btn btn-primary comments-btn" onclick="showComments('${post._id}')">Show Comments</button>
                    <button class="btn btn-success comments-btn" onclick="addComment('${post._id}')">Add Comment</button>
                </div>
                <div id="comments-${post._id}" style="display: none;">
                    <!-- Comments will be dynamically added here -->
                </div>
            `;

            feedContainer.appendChild(postEl);
        });

        // Set a maximum height for the feed container
        feedContainer.style.maxHeight = '100vh'; // You can adjust this value

        // Enable overflow and add a scrollbar
        feedContainer.style.overflowY = 'auto';
    });
}


function showComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    if (commentsContainer.style.display === 'none') {
        // Fetch and display comments
        fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(async comments => {
            commentsContainer.innerHTML = '';

            for (const comment of comments) {
                const user = await getUserById(comment.user); // Fetch user's name
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <p><strong>${user.userName}</strong></p>
                    <p>${comment.text}</p>
                `;
                commentsContainer.appendChild(commentElement);
            }

            commentsContainer.style.display = 'block';
            commentsContainer.style.marginTop = '10px'
            commentsContainer.style.border = "thin solid #777";
            commentsContainer.style.padding = "10px";
        });
    } else {
        commentsContainer.style.display = 'none';
    }
}


// Modify your addComment function in feed.js
function addComment(postId) {
    // Display the custom comment pop-up
    const commentPopup = document.getElementById('commentPopup');
    commentPopup.style.display = 'block';

    // Event listener for the cancel button
    document.getElementById('cancelCommentButton').addEventListener('click', function() {
        // Hide the comment pop-up if the user clicks cancel
        commentPopup.style.display = 'none';
    });

    // Event listener for the submit button
    document.getElementById('submitCommentButton').addEventListener('click', function() {
        // Get the comment text from the text area
        const commentText = document.getElementById('commentText').value;

        // Hide the comment pop-up
        commentPopup.style.display = 'none';

        if (commentText.trim() !== '') {  // Check if the comment is not empty
            const postData = {
                text: commentText
            };

            fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(postData)
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response as needed
                console.log(data);
                // Optionally, you can refresh the feed to show the updated comments
                loadFeed();
            })
            .catch(error => console.error('Error:', error));
        }
    });
}


function submitComment() {
    const postId = document.getElementById('commentPostId').value;
    const commentText = document.getElementById('commentText').value;

    if (commentText.trim() !== '') {
        const postData = {
            text: commentText
        };

        fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response as needed
            console.log(data);
            // Optionally, you can refresh the feed to show the updated comments
            loadFeed();
        })
        .catch(error => console.error('Error:', error));

        // Close the comment modal
        $('#commentModal').modal('hide');
    }
}

async function getUserById(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}/name`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return { userName: 'Unknown' }; // Default to 'Unknown' if there's an error
    }
}