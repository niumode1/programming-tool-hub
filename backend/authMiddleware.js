// 1. 补充核心依赖（确保所有用到的模块都被引入）
const jwt = require('jsonwebtoken');
require('dotenv').config(); // 加载环境变量

// 2. 环境变量校验（避免JWT密钥为空导致的安全问题）
if (!process.env.JWT_SECRET) {
  console.warn('[警告] 未配置 JWT_SECRET 环境变量，使用默认密钥（仅适用于开发环境）');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-123456'; // 开发环境默认密钥

/**
 * 验证用户登录状态中间件
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const authMiddleware = (req, res, next) => {
  try {
    // 1. 提取Authorization头（容错：处理大小写/空值）
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        code: 'NO_TOKEN',
        message: '未提供认证令牌，请在请求头中携带 Bearer Token' 
      });
    }

    // 2. 验证Token格式（必须以Bearer开头）
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token || token.trim() === '') {
      return res.status(401).json({ 
        code: 'INVALID_TOKEN_FORMAT',
        message: '令牌格式错误，正确格式：Bearer <token>' 
      });
    }

    // 3. 验证Token有效性（过期/签名错误）
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. 校验解码后的用户信息（避免无效数据）
    if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
      return res.status(401).json({ 
        code: 'INVALID_USER_DATA',
        message: '令牌中用户信息无效' 
      });
    }

    // 5. 将用户信息挂载到请求对象
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      exp: decoded.exp // 过期时间（可选）
    };
    next();

  } catch (error) {
    // 细分错误类型，返回更精准的提示
    let errorMsg = '令牌无效或已过期';
    let errorCode = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      errorMsg = '令牌已过期，请重新登录';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorMsg = '令牌签名无效，请确认令牌正确性';
      errorCode = 'INVALID_SIGNATURE';
    }

    return res.status(401).json({
      code: errorCode,
      message: errorMsg,
      // 开发环境返回错误详情（生产环境可移除）
      ...(process.env.NODE_ENV === 'development' && { detail: error.message })
    });
  }
};

/**
 * 验证管理员权限中间件（需配合authMiddleware使用）
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const adminMiddleware = (req, res, next) => {
  // 1. 先校验用户是否已通过登录验证
  if (!req.user) {
    return res.status(401).json({ 
      code: 'UNAUTHORIZED',
      message: '请先完成登录认证' 
    });
  }

  // 2. 校验管理员角色
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ 
      code: 'FORBIDDEN',
      message: '没有管理员权限，无法执行该操作' 
    });
  }
};

// 3. 补充完整导出（支持按需导入）
module.exports = {
  authMiddleware,
  adminMiddleware,
  // 导出JWT_SECRET（便于其他模块复用，如生成Token时）
  JWT_SECRET
};