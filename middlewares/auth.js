const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mamatrading_jwt_secret_key_2026!';

/**
 * JWT 토큰 생성
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

/**
 * 관리자 JWT 토큰 검증 미들웨어
 */
function verifyAdminToken(req, res, next) {
    let token = null;

    // 1. HTTP-Only Cookie에서 토큰 확인
    if (req.cookies && req.cookies.admin_token) {
        token = req.cookies.admin_token;
    }
    // 2. Authorization Header (Bearer <token>)에서 토큰 확인
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // API 요청인 경우 JSON 응답, 페이지 요청인 경우 로그인 페이지로 리다이렉트
        if (req.path.startsWith('/api/') || req.xhr) {
            return res.status(401).json({ success: false, message: '인증 토큰이 없습니다. 다시 로그인해 주세요.' });
        }
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminUser = decoded;
        next();
    } catch (err) {
        if (req.path.startsWith('/api/') || req.xhr) {
            return res.status(401).json({ success: false, message: '유효하지 않거나 만료된 토큰입니다.' });
        }
        res.clearCookie('admin_token');
        return res.redirect('/admin/login?error=expired');
    }
}

module.exports = {
    JWT_SECRET,
    generateToken,
    verifyAdminToken
};
