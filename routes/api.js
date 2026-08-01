const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');

// 메모리 임시 저장소 (DB 미연결 시 백업용)
const memoryApplications = [];

/**
 * @route   POST /api/apply
 * @desc    대출 3분 안심 한도조회 접수 API
 */
router.post('/apply', async (req, res) => {
    try {
        const { userName, userPhone, userAmount, loanType, agreeChk } = req.body;

        // 필수 항목 검증
        if (!userName || !userPhone) {
            return res.status(400).json({
                success: false,
                message: '성함과 연락처를 정확히 입력해 주세요.'
            });
        }

        // 연락처 숫자만 추출
        const cleanPhone = userPhone.replace(/[^0-9]/g, '');
        const amountStr = userAmount || '미지정';
        const typeStr = loanType || '일반대출';
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        let insertId = null;

        try {
            // 1. loan_applications 테이블에 DB 저장
            const [result] = await dbPool.query(
                `INSERT INTO loan_applications 
                (applicant_name, applicant_phone, desired_amount, loan_type, agreed_privacy, status, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
                [userName, cleanPhone, amountStr, typeStr, agreeChk ? 1 : 0, clientIp, userAgent]
            );
            insertId = result.insertId;

            console.log(`🎉 [DB 데이터 삽입 성공!] 테이블: GET_DBDATA.loan_applications | ID: ${insertId} | 성함: ${userName} | 연락처: ${cleanPhone}`);

        } catch (dbErr) {
            console.error('❌ [DB 데이터 삽입 실패! - DB 권한 거부 상태]:', dbErr.message);
            
            // DB 연결 불가 시 임시 메모리 저장 백업
            const backupItem = {
                id: Date.now(),
                userName,
                userPhone: cleanPhone,
                userAmount: amountStr,
                loanType: typeStr,
                createdAt: new Date().toISOString()
            };
            memoryApplications.push(backupItem);
            insertId = backupItem.id;
        }

        return res.json({
            success: true,
            applicationId: insertId,
            message: `[${userName}] 님의 3분 안심 한도조회 접수가 완료되었습니다.\n담당 상담원이 15분 이내로 안내 연락드리겠습니다!`
        });

    } catch (err) {
        console.error('❌ 접수 처리 에러:', err);
        return res.status(500).json({
            success: false,
            message: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        });
    }
});

/**
 * @route   GET /api/applications (관리자/테스트용)
 */
router.get('/applications', async (req, res) => {
    try {
        const [rows] = await dbPool.query(`SELECT * FROM loan_applications ORDER BY id DESC LIMIT 50`);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.json({ success: true, count: memoryApplications.length, data: memoryApplications, isMemory: true });
    }
});

module.exports = router;
