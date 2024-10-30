const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index', { title: 'EJS', message: 'Hello EJS' }); // render(파일명, {변수})
})


//
const posts = [
    { title: "test title1", content: "test content1" },
    { title: "test title2", content: "test content2" },
    { title: "test title3", content: "test content3" }
];
app.get('/sample', (req, res) => {
    res.render('sample', { data: posts });
});
app.listen(port, () => {
    console.log(`서버 시작 : ${port}`);
});

