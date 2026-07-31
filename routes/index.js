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

// 상담 신청 API Endpoint
router.post('/api/apply', (req, res) => {
    const { userName, userPhone, userAmount, userJob } = req.body;

    if (!userName || !userPhone || !userAmount) {
        return res.status(400).json({
            success: false,
            message: '필수 항목(성함, 연락처, 희망금액)을 모두 입력해 주세요.'
        });
    }

    // 성공 응답 (실제 운용 시 DB 저장 또는 텔레그램/알림톡/메일 전송 연동)
    return res.json({
        success: true,
        message: `${userName} 고객님, 3분 안심 한도 조회가 정상 접수되었습니다. 담당 전문 상담원이 빠른 시일 내 연락드리겠습니다.`,
        data: { userName, userAmount, userJob }
    });
});

module.exports = router;
