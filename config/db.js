require('dotenv').config();
const mysql = require('mysql2/promise');

// MySQL Connection Pool (GET_DBDATA)
const pool = mysql.createPool({
    host: process.env.DB_HOST || '175.125.92.74',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'dbmanager',
    password: process.env.DB_PASSWORD || 'dbmanager1234!',
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
        console.log('✅ MySQL DB (GET_DBDATA) 175.125.92.74 연결 성공!');
        connection.release();
        return true;
    } catch (error) {
        console.warn('⚠️ MySQL DB 연결 대기 중 (DB 미가동 시 메모리 저장 모드로 동작합니다):', error.message);
        return false;
    }
}

testConnection();

module.exports = pool;
