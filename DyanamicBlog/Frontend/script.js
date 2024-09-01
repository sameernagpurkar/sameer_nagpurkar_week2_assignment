document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    const newPostBtn = document.getElementById('new-post-btn');
    const postModal = document.getElementById('post-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const postForm = document.getElementById('post-form');
    let editingPostId = null;

    // Load posts from the server
    function loadPosts() {
        fetch('http://localhost:3000/posts')
            .then(response => response.json())
            .then(posts => {
                postsContainer.innerHTML = '';
                posts.forEach(post => {
                    const postElement = document.createElement('article');
                    postElement.className = 'post';
                    postElement.innerHTML = `
                        <h2>${post.title}</h2>
                        <p>${post.content}</p>
                        <button class="edit-btn" data-id="${post.id}">Edit</button>
                        <button class="delete-btn" data-id="${post.id}">Delete</button>
                    `;
                    postsContainer.appendChild(postElement);
                });

                // Add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        editingPostId = parseInt(btn.dataset.id, 10);
                        fetch(`http://localhost:3000/posts/${editingPostId}`)
                            .then(response => response.json())
                            .then(post => {
                                document.getElementById('post-title').value = post.title;
                                document.getElementById('post-content').value = post.content;
                                document.getElementById('modal-title').innerText = 'Edit Post';
                                postModal.style.display = 'flex';
                            });
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const postId = parseInt(btn.dataset.id, 10);
                        fetch(`http://localhost:3000/posts/${postId}`, { method: 'DELETE' })
                            .then(() => loadPosts());
                    });
                });
            })
            .catch(err => console.error('Error loading posts:', err));
    }

    // Handle form submission
    postForm.addEventListener('submit', event => {
        event.preventDefault();
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;

        if (editingPostId) {
            fetch(`http://localhost:3000/posts/${editingPostId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            })
            .then(() => {
                loadPosts();
                postModal.style.display = 'none';
                editingPostId = null;
            })
            .catch(err => console.error('Error updating post:', err));
        } else {
            fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            })
            .then(() => {
                loadPosts();
                postModal.style.display = 'none';
            })
            .catch(err => console.error('Error creating post:', err));
        }
    });

    // Show modal for new post
    newPostBtn.addEventListener('click', () => {
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('modal-title').innerText = 'Create New Post';
        postModal.style.display = 'flex';
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        postModal.style.display = 'none';
        editingPostId = null;
    });

    // Initial load
    loadPosts();
});
