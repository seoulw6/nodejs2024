const express = require('express');
const moment = require('moment');
const sqlite3 = require('sqlite3');
const path = require('path');

//database setting
const db_name = path.join(__dirname, "post.db"); //sqlite3는 database file name 지정해줘야함.
const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'post.db'");
});

const create_sql = `
    create table if not exists posts(
        id integer primary key autoincrement,
        title varchar(255),
        content text,
        author varchar(100),
        createdAt datetime default current_timestamp,
        count integer default 0
    );
`;
db.serialize(() => {
    db.run(create_sql, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Successful creation of the 'posts' table");
    });
});
//npx nodemon api.js
//post.db 파일 생성됨
//serialize는 db에 query를 순차적으로 실행하도록 하는 함수 


const app = express();
const PORT = 3001;
app.use(express.json());

app.post('/posts', (req, res) => {
    const { title, content, author } = req.body;
    // const time = moment().format('YYYY-MM-DD HH:mm:ss');
    const sql = `insert into posts (title, content, author) values (?, ?, ?)`;
    db.run(sql, [title, content, author], function (err) {
        //run() db.run은 query를 실행하는 함수
        if (err) {
            return res.sendStatus(500).json({ error: err.message });
        }
        console.log(`row id : ${JSON.stringify(this)}`);
        res.status(201).json({ result: `Post has been created successfully.`, id: this.lastID });
    });
});

//http://localhost:3000/posts?page=2
app.get('/posts', (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    //page 1 -> 0, page 2 -> 5, page 3 -> 10

    let sql = `select id,title,author, createdAt,count from posts order by createdAt desc limit ? offset ?`;
    db.all(sql, [limit, offset], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let total_sql = `select count(*) as count from posts`;
        db.get(total_sql, (err1, row) => {  //전체 게시물 수 하나만 가져올때  get() 사용
            if (err1) {
                return res.status(500).json({ error: err1.message });
            }
            const total = row.count;
            const totalPages = Math.ceil(total / limit);
            res.status(200).json({ totalPages: totalPages, currentPage: page, limit: limit, items: rows });
        });

        res.status(200).json({ items: rows });
    });
});

app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    let sql = `select * from posts where id = ?`;
    let count_sql = `update posts set count = count + 1 where id = ?`;
    db.run(count_sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.get(sql, [id], (err1, row) => {
            if (err1) {
                return res.status(500).json({ error: err1.message });
            }
            res.json({ item: row });
        })
    });
});

app.put('/posts/:id', (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    let sql = `update posts set title = ?, content = ? where id = ?`;
    try {
        const result = db.prepare(sql).run([title, content, id]);
        console.log(` updated result : ${JSON.stringify(result)}`);
        if (result.changes) {
            res.json({ result: `Post has been updated successfully.` });
        } else {
            res.status(404).json({ error: `Post not found.` });
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.delete('/posts/:id', (req, res) => {
    const id = req.params.id;
    let sql = `delete from posts where id = ?`;
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ result: `Post has been deleted successfully.` });
    });
});


//comments 추가
app.post('/posts/:id/comments', (req, res) => {
    const id = req.params.id;
    const { content, author } = req.body;
    const sql = `insert into comments (content, author, post_id) values (?, ?, ?)`;
    try {
        const result = db.prepare(sql).run([content, author, id]);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});


app.get('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const sql = `select * from comments where postId = ?`;
    try {
        const result = db.prepare(sql).all([postId]);
        res.json({ comments: comments });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});

