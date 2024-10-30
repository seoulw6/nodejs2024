const express = require('express');
const path = require('path');
const models = require('./models'); //models/index.js
//models/index.js에서 module.exports = db;로 db를 익스포트 했기 때문에 models로 가져올 수 있다. 
//models === db


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //true면 복잡한것도 들어간다.


app.post('/posts', async (req, res) => {
    const { title, content, author } = req.body;
    const post = await models.Post.create({
        title,
        content,
        author,
    });
    res.status(201).json(post);
});

app.get('/posts', async (req, res) => {
    const posts = await models.Post.findAll();
    res.json(posts);
});

app.get('/posts/:id', async (req, res) => {
    const { id } = req.params.id;
    const post = await models.Post.findOne({
        where: { id },
    });
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
});






//npx nodemon app.js
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    models.sequelize
        .sync({ force: false }) // 중요 : force: true로 설정하면 서버 실행 시마다 테이블 재생성-> 데이터 삭제됨 주의
        .then(() => {
            console.log('DB 연결 성공');
        })
        .catch((err) => {
            console.error(err);
            process.exit();
        });
});