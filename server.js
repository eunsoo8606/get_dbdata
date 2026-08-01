const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static Folder Setup (public)
app.use(express.static(path.join(__dirname, 'public')));

// SEO Robots & Sitemap Support
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Routes Import
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const apiRoutes = require('./routes/api');

// Routes Middleware
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('index', { 
        pageTitle: '페이지를 찾을 수 없습니다 - 마마트레이딩',
        alertMsg: '요청하신 페이지가 존재하지 않습니다.'
    });
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 마마트레이딩 대출 랜딩페이지 서버가 시작되었습니다.`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`=================================================`);
});
