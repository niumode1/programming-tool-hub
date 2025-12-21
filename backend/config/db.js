const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池（保留你的默认值，优先读取.env）
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // 你的默认值是root，.env中是admin，会自动覆盖
  password: process.env.DB_PASSWORD || 'password', // 你的默认值是password，.env中是123456，会自动覆盖
  database: process.env.DB_NAME || 'codestart_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 新增：数据库连接测试（启动时验证，便于排查问题）
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ 数据库连接成功（配置：', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'codestart_hub'
    }, '）');
  } catch (err) {
    console.error('❌ 数据库连接失败：', err.message);
    console.error('⚠️  请检查：1. MySQL是否启动 2. .env中的账号/密码是否正确 3. 数据库codestart_hub是否存在');
  }
})();

module.exports = pool;