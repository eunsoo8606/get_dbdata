require('dotenv').config();
const mysql = require('mysql2/promise');

// MySQL Connection Pool (GET_DBDATA)
const pool = mysql.createPool({
    host: process.env.DB_HOST || '175.125.92.74',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'dbmanager',
    password: process.env.DB_PASSWORD || 'tkfkd8606!',
    database: process.env.DB_NAME || 'GET_DBDATA',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000
});

// DB 커넥션 테스트
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('🎉 [DB 연결 성공!] MySQL GET_DBDATA (175.125.92.74) 커넥션이 완벽하게 연결되었습니다.');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ [DB 연결 실패 - Access Denied!]: MySQL에 "dbmanager"@"%" (비밀번호: tkfkd8606!) 권한을 부여해 주세요.');
        console.error('👉 에러 내용:', error.message);
        return false;
    }
}

testConnection();

module.exports = pool;
