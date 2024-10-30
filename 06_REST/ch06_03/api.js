const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const db_name = path.join(__dirname, 'post.db');
const db = new Database(db_name);

const app = express();
const PORT = 4000;

const create_sql = `
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200),
        content TEXT,
        author VARCHAR(100),
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        count INTEGER DEFAULT 0
    );
`;
db.exec(create_sql); //exec: execute

const schema = buildSchema(`
    type Post { #object type
        id: ID!
        title: String
        content: String
        author: String
        createAt: String
    }
    type Query { #read
        getPosts:[Post]
        getPost(id: ID!): Post
    }
    input PostInput { #input type
        title: String
        content: String
        author: String
    }
    type Mutation { #create, update, delete
        createPost(input: PostInput): Post
        updatePost(id: ID!, input: PostInput): Post
        deletePost(id: ID!): String
    }
`);

//resolver schema와 연결 . 실행함수모음
const root = {
    getPosts: () => {
        return db.prepare('SELECT * FROM posts').all(); //all: 모든 데이터를 가져옴
    },
    getPost: ({ id }) => {
        return db.prepare('SELECT * FROM posts WHERE id = ?').get(id); //get: 하나의 데이터를 가져옴
    },
    createPost: ({ input }) => { //create
        const info = db.prepare(`
            INSERT INTO posts (title, content, author) VALUES (?, ?, ?)
        `).run(input.title, input.content, input.author);
        return { id: info.lastInsertRowid, ...input }
    },
    updatePost: ({ id, input }) => { //update
        const info = db.prepare('UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?').run(input.title, input.content, input.author, id);
        return { id, ...input }
    },
    deletePost: ({ id }) => { //delete
        db.prepare('DELETE FROM posts WHERE id = ?').run(id);
        return 'Deleted';
    }
}
app.use("/graphql", graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}))

app.listen(PORT, () => {
    console.log(PORT, '번 포트에서 서버 대기 중');
});