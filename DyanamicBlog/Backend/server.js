const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Default MySQL user
    password: '', // Default MySQL password (blank if not set)
    database: 'blogweb'
});

// Connect to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Get all blog posts
app.get('/posts', (req, res) => {
    const query = 'SELECT * FROM posts';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ message: 'Error fetching posts' });
        }
        res.json(results);
    });
});

// Get a single blog post by ID
app.get('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const query = 'SELECT * FROM posts WHERE id = ?';
    connection.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post:', err);
            return res.status(500).json({ message: 'Error fetching post' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(results[0]);
    });
});

// Create a new blog post
app.post('/posts', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    const query = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    connection.query(query, [title, content], (err, results) => {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).json({ message: 'Error creating post' });
        }
        res.status(201).json({ id: results.insertId, title, content });
    });
});

// Update a blog post by ID
app.put('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const { title, content } = req.body;

    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    connection.query(query, [title, content, postId], (err, results) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).json({ message: 'Error updating post' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ id: postId, title, content });
    });
});

// Delete a blog post by ID
app.delete('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const query = 'DELETE FROM posts WHERE id = ?';
    connection.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).json({ message: 'Error deleting post' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(204).end();
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
