const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const { authMiddleware, adminMiddleware } = require('./authMiddleware');
const recommendRouter = require('./routes/recommend');
require('dotenv').config();

const app = express();

// 跨域配置
// 跨域配置（允许所有域名访问）
app.use(cors({
  origin: '*',        // 核心：允许所有域名跨域访问
  credentials: true,  // 允许携带 Cookie/Token
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的请求方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
}));

app.use(express.json());

// 注册接口
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '邮箱和密码不能为空' });
    }

    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'user']
    );

    res.status(201).json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '邮箱和密码不能为空' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'CodeStart_Hub_2025_Secret_Key';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, token }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// -------------- 新增：用户管理接口 --------------
// 1. 管理员获取用户列表（支持搜索）
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 从查询参数获取搜索关键词（适配GET请求的参数传递）
    const keyword = req.query.keyword || '';
    const [users] = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE email LIKE ? ORDER BY id DESC',
      [`%${keyword}%`] // 模糊搜索邮箱
    );

    res.json({ 
      success: true, 
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      })) 
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 2. 管理员更新用户角色
app.put('/api/admin/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 验证角色参数合法性
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: '角色只能是user或admin' });
    }

    // 更新角色
    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, message: '角色更新成功' });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 3. 管理员删除用户（可选扩展）
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// -------------- 原有管理员工具审核接口 --------------
// 管理员获取待审核推荐列表
app.get('/api/admin/pending-tools', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [recommendations] = await pool.query(`
      SELECT tr.*, u.email as recommenderEmail 
      FROM tool_recommendations tr
      JOIN users u ON tr.recommender_id = u.id
      WHERE tr.status = 'pending'
      ORDER BY tr.id DESC
    `);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('获取待审核列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 管理员审核通过推荐
app.post('/api/admin/approve-tool/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [recommendations] = await pool.query('SELECT * FROM tool_recommendations WHERE id = ?', [id]);
    if (recommendations.length === 0) {
      return res.status(404).json({ success: false, message: '推荐记录不存在' });
    }
    const tool = recommendations[0];

    await pool.query('UPDATE tool_recommendations SET status = ? WHERE id = ?', ['approved', id]);
    await pool.query(`
      INSERT INTO tools (name, description, officialUrl, downloadUrl, os, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      tool.name,
      tool.description,
      tool.url,
      tool.url,
      JSON.stringify(tool.os),
      JSON.stringify(['用户推荐'])
    ]);

    res.json({ success: true, message: '审核通过' });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 管理员拒绝推荐
app.post('/api/admin/reject-tool/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await pool.query(
      'UPDATE tool_recommendations SET status = ?, reject_reason = ? WHERE id = ?',
      ['rejected', reason || '无', id]
    );
    res.json({ success: true, message: '已拒绝' });
  } catch (error) {
    console.error('拒绝推荐失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// -------------- 新增：已审核工具（软件）管理接口 --------------
// 1. 管理员获取所有已审核软件（支持搜索）
app.get('/api/tools', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 从查询参数获取搜索关键词（适配前端搜索功能）
    const keyword = req.query.keyword || '';
    const [tools] = await pool.query(`
      SELECT * FROM tools 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ? 
      ORDER BY id DESC
    `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]); // 支持名称/描述/分类搜索

    res.json({ 
      success: true, 
      tools: tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        officialUrl: tool.officialUrl,
        downloadUrl: tool.downloadUrl,
        os: tool.os,
        category: tool.category,
        created_at: tool.created_at
      })) 
    });
  } catch (error) {
    console.error('获取已审核软件失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 2. 管理员获取单个软件详情（适配编辑功能）
app.get('/api/tools/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [tools] = await pool.query('SELECT * FROM tools WHERE id = ?', [id]);
    
    if (tools.length === 0) {
      return res.status(404).json({ success: false, message: '软件不存在' });
    }

    res.json({ 
      success: true, 
      tool: tools[0] 
    });
  } catch (error) {
    console.error('获取软件详情失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 3. 管理员编辑软件信息
app.put('/api/tools/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, officialUrl, downloadUrl, os, category } = req.body;

    // 验证必填参数
    if (!name) {
      return res.status(400).json({ success: false, message: '软件名称不能为空' });
    }

    // 更新软件信息
    const [result] = await pool.query(`
      UPDATE tools 
      SET name = ?, description = ?, officialUrl = ?, downloadUrl = ?, os = ?, category = ? 
      WHERE id = ?
    `, [name, description || '', officialUrl || '', downloadUrl || '', os || '', category || '', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '软件不存在' });
    }

    res.json({ success: true, message: '软件信息更新成功' });
  } catch (error) {
    console.error('编辑软件失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 4. 管理员删除软件
app.delete('/api/tools/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tools WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '软件不存在' });
    }

    res.json({ success: true, message: '软件删除成功' });
  } catch (error) {
    console.error('删除软件失败:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
});

// 修正：路由挂载移到启动服务器之前（否则路由失效）
app.use('/api/recommend-tool', recommendRouter);

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动`);
  console.log(`📡 服务地址：http://115.190.234.119:${PORT}`);
  console.log(`🔑 JWT密钥：${process.env.JWT_SECRET ? '已配置' : '使用兜底密钥（生产环境请配置.env）'}`);
  console.log(`👥 用户管理接口已启用：/api/admin/users`);
  console.log(`🔧 工具管理接口已启用：/api/tools`); // 新增日志提示
});
