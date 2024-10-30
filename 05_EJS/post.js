const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/list', (req, res) => {
    let data = { data: [] };
    try {
        data = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
    } catch (e) {
        data = { data: [] };
    }
    res.render('list', { posts: data.data });
})

app.get('/create', (req, res) => {
    res.render('create');
})

app.use(express.urlencoded({ extended: true })); //post방식 사용시 필수


let maxId = 0;
const initId = () => {
    try {
        let result = rs.readFileSync('test.json', 'utf-8');
        let data = JSON.parse(result);
        let posts = data.data;
        let idList = posts.map(x => parseInt(x.id));
        maxId = Math.max(...idList); // ...은 배열을 풀어서 전달 Math.max(1,2,3,4,5) 포맷을 바꾸어 전달
    } catch (e) {
        maxId = 0;
    }
}
initId();

const getNextId = () => {
    return ++maxId;
}




app.post('/create', (req, res) => {
    let title = req.body.title;
    let content = req.body.content;
    let author = req.body.author;

    let readed;
    try {
        readed = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
    } catch (e) {
        readed = {
            data: []
        }
    }
    let newPost = {
        id: getNextId(),
        title: title,
        content: content,
        author: author,
        createAt: new Date(),
        count: 0
    }
    readed.data.push(newPost);
    fs.writeFileSync('test.json', JSON.stringify(readed), 'utf-8');
    res.redirect('/list');
    //
});

app.get('/view/:id', (req, res) => {
    let id = req.params.id;
    let data = { data: [] };
    try {
        data = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
    } catch (e) {
        data = { data: [] };
    }
    let post = {};
    data.data.forEach(item => {
        if (item.id == id) {
            post = item;
            item.count++;
        }
    });
    fs.writeFileSync('test.json', JSON.stringify(data), 'utf-8');
    res.render('view', { post: post });
})


app.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    let data = { data: [] };
    try {
        data = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
    } catch (e) {
        data = { data: [] };
    }
    let post = {};
    data.data.forEach(item => {
        if (item.id == id) {
            post = item;
            // item.count++;
        }
    });
    // fs.writeFileSync('test.json', JSON.stringify(data), 'utf-8');
    res.render('edit', { post: post });
})


app.post('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { title, content, author } = req.body;
    let data = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
    data.data.forEach(item => {
        if (item.id == id) {
            item.title = title;
            item.content = content;
            item.author = author;
        }
    });
    fs.writeFileSync('test.json', JSON.stringify(data), 'utf-8');
    res.render(`view/${id}`);
});

app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    //res.render('create');
})

app.listen(port, () => {
    console.log(`서버 시작 : ${port}`);
})