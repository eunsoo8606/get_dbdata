const express = require('express');
const router = express.Router();

// 상품 데이터 정의
const productsData = {
    'employee': {
        id: 'employee',
        name: '직장인 / 사업자 대출',
        icon: 'bi-briefcase-fill',
        maxAmount: '최대 5,000만원',
        interestRate: '연 5.0% ~ 20.0% 이내',
        period: '1개월 ~ 60개월',
        badge: '가장 빠른 승인',
        target: '4대보험 가입자, 프리랜서, 자영업자, 사업자',
        summary: '재직 및 소득 확인을 통해 타사 대비 넉넉하고 신속하게 승인되는 맞춤 대출',
        features: [
            '4대보험 미가입 프리랜서 및 신규 사업자도 승인 가능',
            '타사 기존 대출이 있어도 추가 한도 산출',
            '무방문 비대면 10분 당일 계좌 입금'
        ]
    },
    'unemployed': {
        id: 'unemployed',
        name: '무직자 / 비상금 소액대출',
        icon: 'bi-lightning-charge-fill',
        maxAmount: '최대 1,000만원',
        interestRate: '연 5.0% ~ 20.0% 이내',
        period: '1개월 ~ 60개월',
        badge: '무서류 · 무방문',
        target: '소득 증빙이 어려운 무직자, 대학생, 청년층, 주부',
        summary: '복잡한 서류 제출 없이 신용점수 하락 걱정 없이 당일 바로 이용 가능한 비상금',
        features: [
            '소득 증빙 서류 없이 본인 명의 휴대폰 인증만으로 OK',
            '신용조회 이력이 남지 않는 100% 안심 가심사',
            '급한 생활비, 결제대금 365일 24시간 즉시 지원'
        ]
    },
    'women': {
        id: 'women',
        name: '여성 / 주부 우대 대출',
        icon: 'bi-heart-pulse-fill',
        maxAmount: '최대 2,000만원',
        interestRate: '연 5.0% ~ 20.0% 이내',
        period: '1개월 ~ 60개월',
        badge: '100% 비밀보장',
        target: '전업주부, 여성 사업자, 여성 프리랜서',
        summary: '가족이나 배우자 통보 없이 전담 여성 상담원과의 1:1 익명 비밀 상담 진행',
        features: [
            '재직 확인 전화 X, 가족 통보 X (100% 보안 유지)',
            '전담 여성 전문 상담원 우선 배치',
            '배우자 소득 미확인 시에도 본인 명의 간편 승인'
        ]
    },
    'business': {
        id: 'business',
        name: '자영업 / 사업자 대출',
        icon: 'bi-shop',
        maxAmount: '최대 5,000만원',
        interestRate: '연 5.0% ~ 20.0% 이내',
        period: '1개월 ~ 60개월',
        badge: '사업자 우대 한도',
        target: '개인사업자, 법인사업자, 간이과세자, 자영업자',
        summary: '사업 운영자금, 물품대금, 카드매출 정산 자금이 급할 때 든든한 맞춤 대출',
        features: [
            '사업자등록증 보유 시 우대 한도 적용',
            '매출이 적거나 신규 오픈 매장도 승인 상담 가능',
            '중도상환수수료 부담 최소화로 여유 시 자유 상환'
        ]
    },
    'lowcredit': {
        id: 'lowcredit',
        name: '저신용 / 다중채무 대출',
        icon: 'bi-person-fill-gear',
        maxAmount: '최대 3,000만원',
        interestRate: '연 5.0% ~ 20.0% 이내',
        period: '1개월 ~ 60개월',
        badge: '부결자 전용 플랜',
        target: '1·2금융권 거절자, 저신용자, 기대출 보유자',
        summary: '기존 대출이 많거나 신용점수가 낮아 고민하시는 분을 위한 특화 승인 솔루션',
        features: [
            '타사 거절 이력이 있어도 자체 승인 심사',
            '다중 채무 통합 및 통합 상환 플랜 제시',
            '과도한 부담 없이 상환 능력 맞춤 금액 설정'
        ]
    },
    'debt-consolidation': {
        id: 'debt-consolidation',
        name: '대환 / 통신연체 대납대출',
        icon: 'bi-arrow-repeat',
        maxAmount: '최대 5,000만원',
        interestRate: '연 5.0% ~ 20.0% 이내',
        period: '1개월 ~ 120개월',
        badge: '부담 경감',
        target: '고금리 대출 이용자, 통신 연체 보유자, 대납 필요자',
        summary: '흩어진 고금리 대출을 하나로 묶고 통신 연체를 즉시 대납하여 신용 회복 지원',
        features: [
            '고금리 부채 대환을 통한 월 이자 부담 획기적 감소',
            '통신 연체금 즉시 대납으로 폰 개통 및 정상화 지원',
            '최장 120개월 여유 있는 분할 상환 기간 선택'
        ]
    }
};

// 상품 전체 보기 및 개별 상세 라우트
router.get('/:category', (req, res) => {
    const category = req.params.category;
    const product = productsData[category];

    if (!product) {
        return res.redirect('/');
    }

    res.render('product-detail', {
        pageTitle: `${product.name} | 든든한대부중개`,
        currentNav: 'products',
        product: product,
        allProducts: Object.values(productsData)
    });
});

module.exports = router;
