// Add this function to fetch and display the list of users
function getUsersList() {
    const postData = {
        userId : localStorage.getItem('userId')
    } 
    
    fetch('http://localhost:3000/api/users-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        const usersListContainer = document.getElementById('usersList');

        // Clear existing content
        usersListContainer.innerHTML = '';

        // Populate the list with user data
        data.forEach(user => {
            const userCard = document.createElement('div');
            userCard.classList.add('col-md-4', 'mb-4');

            userCard.innerHTML = `
                <div class="card">
                    <img src="${user.profilePic || './images/default-profile.jpg'}" class="card-img-top" alt="User Image">
                    <div class="card-body">
                        <h5 class="card-title">${user.name}</h5>
                        <button class="btn btn-primary btn-sm" onclick="sendFollowRequest('${user._id}')">Follow</button>
                        <button class="btn btn-danger btn-sm ml-2" onclick="blockUser('${user._id}')">Block</button>
                    </div>
                </div>
            `;

            usersListContainer.appendChild(userCard);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Function to send block user request
function blockUser(userId) {
    fetch(`http://localhost:3000/api/users/block/${userId}`, {
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
    })
    .catch(error => console.error('Error:', error));
}

// Function to send follow request
function sendFollowRequest(userId) {
    fetch(`http://localhost:3000/api/users/follow-request/${userId}`, {
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
    })
    .catch(error => console.error('Error:', error));
}


// Call this function when the explore.html page is loaded
document.addEventListener('DOMContentLoaded', function() {
    getUsersList();
});
