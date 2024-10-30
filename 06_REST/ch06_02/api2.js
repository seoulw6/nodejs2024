const express = require('express');
const moment = require('moment');
const path = require('path');
const Database = require('better-sqlite3');

const db_name = path.join(__dirname, 'post.db');
const db = new Database(db_name);
const create_sql = `
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title varchar(255),
        content TEXT,
        author varchar(100),
        count INTEGER default 0,
        createdAt DATETIME default CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        postId INTEGER,
        foreign key(postId) references posts(id)
    );
`;

db.exec(create_sql);
const app = express();
const PORT = 3002;
app.use(express.json());


//GET localhost:3002/posts?page=2 list  
app.get('/posts', (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const sql = `
        SELECT id,title,author,createdAt FROM posts 
        order by id desc limit ? offset ?;
    `;
    const stmt = db.prepare(sql);
    const rows = stmt.all(limit, offset);

    const total_sql = `SELECT count(*) as count FROM posts`;
    const row = db.prepare(total_sql).get();
    const totalPages = Math.ceil(row.count / limit);

    res.json({ items: rows, currentPage: page, totalPages: totalPages });
});

// GET localhost:3002/posts/1 detail
app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT 
    p.*, '[' || group_concat( '{"id":'||c.id||',"content":"'||c.content||'"}') || ']' as comments 
    FROM posts  p left join comments c on p.id=c.postId WHERE p.id = ? group by p.id`;
    const count_sql = `UPDATE posts SET count = count + 1 WHERE id = ?`;
    try {
        db.prepare(count_sql).run(id);
        const post = db.prepare(sql).get(id);
        if (!post) {
            res.status(404).json({ error: `Post not found.` });
        }
        // const comments = db.prepare(`SELECT * FROM comments WHERE postId = ?`).all(id);
        post.comments = JSON.parse(post.comments);
        res.status(200).json({ item: post });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


//POST localhost:3002/posts add
app.post('/posts', (req, res) => {
    const { title, content, author } = req.body;
    const sql = `INSERT INTO posts (title, content, author) VALUES (?, ?, ?)`;
    const result = db.prepare(sql).run(title, content, author);
    console.log(`result : ${JSON.stringify(result)}`);
    res.status(201).json({ id: result.lastInsertRowid, title, content, author });
});//callback 안써서 간결해짐

//PUT localhost:3002/posts/1 update
app.put('/posts/:id', (req, res) => {
    const id = req.params.id;
    let sql = `update posts set title = ?, content = ? where id = ?`;
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: `title or content is required.` });
        }
        const result = db.prepare(sql).run(title, content, id);
        console.log(`result : ${JSON.stringify(result)}`);
        if (result.changes) {
            res.status(200).json({ result: `Post has been updated successfully.` });
        } else {
            res.status(404).json({ error: `Post not found.` });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//DELETE localhost:3002/posts/1 delete
app.delete('/posts/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM posts WHERE id = ?`;
    try {
        const result = db.prepare(sql).run(id);
        if (result.changes) {
            res.status(200).json({ result: `Post has been deleted successfully.` });
        } else {
            res.status(404).json({ error: `Post not found.` });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


//comments 추가
app.post('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const sql = `insert into comments (content,postId) values (?, ?)`;
    try {
        const result = db.prepare(sql).run([content, postId]);
        res.status(201).json({ id: result.lastInsertRowid, content, postId });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.get('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const sql = `select * from comments where postId = ?`;
    try {
        const comments = db.prepare(sql).all(postId);
        res.status(200).json({ comments: comments });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.put('/comments/:id', (req, res) => {
    const id = req.params.id;
    const { content } = req.body;
    try {
        const result = db.prepare(`update comments set content = ? where id = ?`).run(content, id);
        if (result.changes) {
            res.status(200).json({ result: `Comment has been updated successfully.` });
        } else {
            res.status(404).json({ result: `Comment not found.`, error: `Comment not found.` });
        }
    } catch (e) {
        res.status(500).json({ result: e.message });
    }
});

app.delete('/comments/:id', (req, res) => {
    const id = req.params.id;
    try {
        const result = db.prepare(`delete from comments where id = ?`).run(id);
        if (result.changes) {
            res.status(200).json({ result: `Comment has been deleted successfully.` });
        } else {
            res.status(404).json({ result: `Comment not found.`, error: `Comment not found.` });
        }
    } catch (e) {
        res.status(500).json({ result: e.message });
    }
});

// in react const POST_URL = 'http://localhost:3002/posts';
// const CREATE_POST_U
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});