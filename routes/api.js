const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');
const { parseRefererSource } = require('../utils/referrer');

// DB 테이블 칼럼 자동 보완 (referer_source 추가)
async function ensureRefererColumn() {
    try {
        await dbPool.query(`ALTER TABLE loan_applications ADD COLUMN referer_source VARCHAR(50) DEFAULT '직접입력' AFTER loan_type`);
    } catch (e) {
        // 이미 컬럼이 존재할 경우 무시
    }
}
ensureRefererColumn();

// 메모리 임시 저장소 (DB 미연결 시 백업용)
const memoryApplications = [];

/**
 * @route   POST /api/apply & POST /apply
 * @desc    대출 3분 안심 한도조회 DB 저장 API
 */
router.post(['/apply', '/api/apply'], async (req, res) => {
    try {
        const { userName, userPhone, userAmount, loanType, agreeChk, refererSource } = req.body;

        // 필수 항목 검증
        if (!userName || !userPhone) {
            return res.status(400).json({
                success: false,
                message: '성함과 연락처를 정확히 입력해 주세요.'
            });
        }

        // 유입 경로 판별 (인스타그램, 페이스북, 네이버, 다음, 구글, 빙, 직접입력)
        const sourceStr = refererSource || parseRefererSource(req);
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
                (applicant_name, applicant_phone, desired_amount, loan_type, referer_source, agreed_privacy, status, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
                [userName, cleanPhone, amountStr, typeStr, sourceStr, agreeChk ? 1 : 0, clientIp, userAgent]
            );
            insertId = result.insertId;

            // 2. application_logs 퍼스널 접수 로그 기록 (localhost/127.0.0.1 접속 시 제외)
            const isLocalhost = clientIp.includes('127.0.0.1') || clientIp.includes('::1') || (req.headers.host && req.headers.host.includes('localhost'));

            if (!isLocalhost && insertId) {
                try {
                    await dbPool.query(
                        `INSERT INTO application_logs 
                        (application_id, log_type, action_user, message, result_status) 
                        VALUES (?, 'SYSTEM_RECEIVE', 'SYSTEM', ?, 'SUCCESS')`,
                        [insertId, `신규 대출 접수 [${userName} / ${cleanPhone} / ${amountStr}]`]
                    );
                    console.log(`📝 [퍼스널 로그 기록 완료] Application ID: ${insertId}`);
                } catch (logErr) {
                    console.warn('⚠️ application_logs 생략됨:', logErr.message);
                }
            } else if (isLocalhost) {
                console.log(`ℹ️ [Localhost 테스트 접속] 퍼스널 로그(application_logs) 생성이 스킵되었습니다.`);
            }

            console.log(`🎉 [DB 데이터 삽입 성공!] 테이블: GET_DBDATA.loan_applications | ID: ${insertId} | 성함: ${userName} | 유입경로: ${sourceStr}`);

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
