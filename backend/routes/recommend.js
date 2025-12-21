const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../authMiddleware');

// 提交软件推荐接口（POST请求）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, url, description, os } = req.body;
    const userId = req.user.id; // 从authMiddleware中获取当前登录用户ID

    // 1. 参数验证
    if (!name || !url || !description || !os || os.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写完整信息（软件名称、链接、描述、支持系统均为必填）' 
      });
    }

    // 2. 插入推荐数据到数据库（需确保tool_recommendations表已创建）
    await pool.query(`
      INSERT INTO tool_recommendations (
        name, url, description, os, recommender_id, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      name, 
      url, 
      description, 
      JSON.stringify(os), // 将系统列表转为JSON字符串存储
      userId, 
      'pending' // 初始状态：待审核
    ]);

    res.json({
      success: true,
      message: '推荐提交成功，等待管理员审核'
    });
  } catch (error) {
    console.error('推荐软件失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误：' + error.message
    });
  }
});

module.exports = router;