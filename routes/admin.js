const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dbPool = require('../config/db');
const { generateToken, verifyAdminToken } = require('../middlewares/auth');

// 기본 마스터 계정 (DB에 계정이 없을 경우 fallback 사용)
const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'admin1234!';

/**
 * GET /admin/login - 관리자 로그인 페이지
 */
router.get('/login', (req, res) => {
    res.render('admin/login', {
        pageTitle: '관리자 로그인 | 마마트레이딩',
        error: req.query.error || null
    });
});

/**
 * POST /admin/api/login - JWT 기반 로그인 처리
 */
router.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해 주세요.' });
        }

        let isMatch = false;
        let adminInfo = { id: 1, username: username, role: 'SUPER_ADMIN', name: '마스터 관리자' };

        // 1. DB에서 사용자 조회 시도
        try {
            const [rows] = await dbPool.query(`SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1`, [username]);
            if (rows.length > 0) {
                const user = rows[0];
                isMatch = await bcrypt.compare(password, user.password_hash);
                if (isMatch) {
                    adminInfo = { id: user.id, username: user.username, role: user.role, name: user.user_name };
                }
            } else if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASS) {
                isMatch = true;
            }
        } catch (dbErr) {
            // DB 조회 미지원 또는 미가동 시 기본 아이디/비번 검증
            if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASS) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        // 2. JWT 토큰 발급
        const token = generateToken(adminInfo);

        // 3. HTTP-Only Cookie 설정 (Vercel 및 브라우저 보안 대처)
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 3600 * 1000 // 12시간
        });

        return res.json({
            success: true,
            message: '로그인 성공!',
            token,
            user: adminInfo
        });

    } catch (err) {
        console.error('로그인 에러:', err);
        return res.status(500).json({ success: false, message: '로그인 처리 중 에러가 발생했습니다.' });
    }
});

/**
 * POST /admin/api/logout - 로그아웃
 */
router.post('/api/logout', (req, res) => {
    res.clearCookie('admin_token');
    return res.json({ success: true, message: '로그아웃 되었습니다.' });
});

/**
 * GET /admin/dashboard - 관리자 대시보드 메인 페이지 (JWT 인증 필요)
 */
router.get('/dashboard', verifyAdminToken, (req, res) => {
    res.render('admin/dashboard', {
        pageTitle: '관리자 대시보드 | 마마트레이딩',
        adminUser: req.adminUser
    });
});

/**
 * GET /admin/api/stats - 4대 주요 요약 통계 지표 (JWT 인증 필요)
 */
router.get('/api/stats', verifyAdminToken, async (req, res) => {
    try {
        let stats = { total: 0, today: 0, pending: 0, approved: 0 };
        try {
            const [totalRows] = await dbPool.query(`SELECT COUNT(*) as cnt FROM loan_applications`);
            const [todayRows] = await dbPool.query(`SELECT COUNT(*) as cnt FROM loan_applications WHERE DATE(created_at) = CURDATE()`);
            const [pendingRows] = await dbPool.query(`SELECT COUNT(*) as cnt FROM loan_applications WHERE status = 'PENDING' OR status = 'CONSULTING'`);
            const [approvedRows] = await dbPool.query(`SELECT COUNT(*) as cnt FROM loan_applications WHERE status = 'APPROVED'`);

            stats.total = totalRows[0].cnt;
            stats.today = todayRows[0].cnt;
            stats.pending = pendingRows[0].cnt;
            stats.approved = approvedRows[0].cnt;
        } catch (err) {
            console.warn('DB Stats fallback');
        }
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: '통계 조회 실패' });
    }
});

/**
 * GET /admin/api/analytics - 유입 경로(인스타/페북/네이버/다음/구글/빙/직접입력), 시간대별 몰림, 일별/월별 분석 API
 */
router.get('/api/analytics', verifyAdminToken, async (req, res) => {
    try {
        // 1. 유입 채널별 집계 (인스타그램, 페이스북, 네이버, 다음, 구글, 빙, 직접입력)
        const channels = ['인스타그램', '페이스북', '네이버', '다음', '구글', '빙', '직접입력'];
        let channelStats = {};
        channels.forEach(ch => channelStats[ch] = 0);

        try {
            const [cRows] = await dbPool.query(
                `SELECT COALESCE(referer_source, '직접입력') as source, COUNT(*) as cnt 
                 FROM loan_applications 
                 GROUP BY referer_source`
            );
            cRows.forEach(r => {
                const src = r.source || '직접입력';
                channelStats[src] = (channelStats[src] || 0) + parseInt(r.cnt, 10);
            });
        } catch (e) { console.warn(e.message); }

        // 2. 시간대별 몰림 분석 (00시 ~ 23시)
        let hourlyStats = Array(24).fill(0);
        try {
            const [hRows] = await dbPool.query(
                `SELECT HOUR(created_at) as hr, COUNT(*) as cnt 
                 FROM loan_applications 
                 GROUP BY HOUR(created_at)`
            );
            hRows.forEach(r => {
                if (r.hr !== null && r.hr >= 0 && r.hr < 24) {
                    hourlyStats[r.hr] = parseInt(r.cnt, 10);
                }
            });
        } catch (e) { console.warn(e.message); }

        // 3. 최근 7일 일별 접수 추이
        let dailyStats = [];
        try {
            const [dRows] = await dbPool.query(
                `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as dt, COUNT(*) as cnt 
                 FROM loan_applications 
                 WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                 GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
                 ORDER BY dt ASC`
            );
            dailyStats = dRows;
        } catch (e) { console.warn(e.message); }

        // 4. 최근 12개월 월별 접수 추이
        let monthlyStats = [];
        try {
            const [mRows] = await dbPool.query(
                `SELECT DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(*) as cnt 
                 FROM loan_applications 
                 GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                 ORDER BY ym ASC LIMIT 12`
            );
            monthlyStats = mRows;
        } catch (e) { console.warn(e.message); }

        res.json({
            success: true,
            channelStats,
            hourlyStats,
            dailyStats,
            monthlyStats
        });

    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ success: false, message: '분석 데이터 조회 실패' });
    }
});

/**
 * GET /admin/api/applications - 대출 신청건 리스트 (JWT 인증 필요)
 */
router.get('/api/applications', verifyAdminToken, async (req, res) => {
    try {
        const { status, keyword } = req.query;
        let query = `SELECT * FROM loan_applications WHERE 1=1`;
        let params = [];

        if (status && status !== 'ALL') {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (keyword) {
            query += ` AND (applicant_name LIKE ? OR applicant_phone LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        query += ` ORDER BY id DESC LIMIT 100`;

        const [rows] = await dbPool.query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: '신청 목록 조회 실패' });
    }
});

/**
 * PATCH /admin/api/applications/:id/status - 신청건 상태 및 메모 변경 (JWT 인증 필요)
 */
router.patch('/api/applications/:id/status', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminMemo } = req.body;

        await dbPool.query(
            `UPDATE loan_applications SET status = ?, admin_memo = ? WHERE id = ?`,
            [status, adminMemo || null, id]
        );

        res.json({ success: true, message: '신청건 상태가 변경되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: '상태 변경 실패' });
    }
});

/**
 * DELETE /admin/api/applications/:id - 신청건 삭제 (JWT 인증 필요)
 */
router.delete('/api/applications/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        await dbPool.query(`DELETE FROM loan_applications WHERE id = ?`, [id]);
        res.json({ success: true, message: '신청건이 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: '신청건 삭제 실패' });
    }
});

module.exports = router;
