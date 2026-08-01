const express = require('express');
const router = express.Router();

// 메인 랜딩페이지
router.get('/', (req, res) => {
    res.render('index', {
        pageTitle: '마마트레이딩 | 3분 안심 한도조회 · 당일 입금 맞춤 대출',
        currentNav: 'home'
    });
});

// 대출 절차 상세 페이지
router.get('/process', (req, res) => {
    res.render('process', {
        pageTitle: '대출 절차 안내 | 마마트레이딩',
        currentNav: 'process'
    });
});

// 이용 후기 상세 페이지
router.get('/reviews', (req, res) => {
    res.render('reviews', {
        pageTitle: '고객 실제 이용후기 | 마마트레이딩',
        currentNav: 'reviews'
    });
});

module.exports = router;
