/**
 * HTTP Referer 및 Query Parameter(utm_source)를 분석하여 유입 경로를 분류하는 헬퍼 함수
 */
function parseRefererSource(req) {
    const referer = req.headers.referer || req.headers.referrer || '';
    const utmSource = req.query ? (req.query.utm_source || req.query.ref || '') : '';

    const combinedStr = `${referer} ${utmSource}`.toLowerCase();

    if (combinedStr.includes('instagram') || combinedStr.includes('ig.me')) {
        return '인스타그램';
    } else if (combinedStr.includes('facebook') || combinedStr.includes('fb.com')) {
        return '페이스북';
    } else if (combinedStr.includes('naver') || combinedStr.includes('search.naver')) {
        return '네이버';
    } else if (combinedStr.includes('daum') || combinedStr.includes('kakao')) {
        return '다음';
    } else if (combinedStr.includes('google')) {
        return '구글';
    } else if (combinedStr.includes('bing')) {
        return '빙';
    } else {
        return '직접입력';
    }
}

module.exports = {
    parseRefererSource
};
