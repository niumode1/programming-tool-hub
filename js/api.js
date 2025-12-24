// ====================== 环境配置（修复：移除Node.js的process.env） ======================
// 开发环境=true / 生产环境=false（发布时改为false即可）
const isProduction = false; 
const API_BASE_URL = isProduction 
  ? '/api' // 生产环境：配合后端反向代理
 // : 'http://localhost:3001/api'; // 开发环境：后端地址（确认后端端口是3001！）
 : 'http://115.190.234.119:3001/api';
// ====================== 以下代码完全保留，无需修改 ======================
async function apiRequest(url, method = 'GET', data = null, token = null, signal = null) {
  let requestUrl = `${API_BASE_URL}${url}`;
  if (method.toUpperCase() === 'GET' && data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    const paramsStr = params.toString();
    if (paramsStr) {
      requestUrl += `${requestUrl.includes('?') ? '&' : '?'}${paramsStr}`;
    }
  }

  const options = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept-Language': 'zh-CN',
    },
    signal,
    credentials: 'include',
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token.trim()}`;
  }

  if (data && method.toUpperCase() !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(requestUrl, options);
    
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(result.message || `请求失败（${response.status}）`);
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求已取消');
    } else if (!navigator.onLine) {
      throw new Error('网络连接异常，请检查网络');
    } else {
      throw new Error(error.message || '未知错误，请重试');
    }
  }
}

const api = {
  // 基础认证接口
  login: (data) => apiRequest('/login', 'POST', data),
  register: (data) => apiRequest('/register', 'POST', data),
  logout: (token) => apiRequest('/logout', 'POST', null, token),
  getUserInfo: (token) => apiRequest('/user/info', 'GET', null, token),
  
  // 推荐工具接口
  recommendTool: (data, token) => apiRequest('/recommend-tool', 'POST', data, token),
  getMyRecommendedTools: (token) => apiRequest('/user/recommended-tools', 'GET', null, token),
  
  // 管理员审核接口
  getPendingTools: (token) => apiRequest('/admin/pending-tools', 'GET', null, token),
  approveTool: (id, token) => apiRequest(`/admin/approve-tool/${id}`, 'POST', null, token),
  rejectTool: (id, reason, token) => apiRequest(`/admin/reject-tool/${id}`, 'POST', { reason }, token),
  
  // 工具管理接口
  getAllTools: (params, token) => apiRequest('/tools', 'GET', params, token),
  getToolDetail: (id, token) => apiRequest(`/tools/${id}`, 'GET', null, token),
  updateTool: (id, data, token) => apiRequest(`/tools/${id}`, 'PUT', data, token),
  deleteTool: (id, token) => apiRequest(`/tools/${id}`, 'DELETE', null, token),
  
  // ============ 新增：用户管理接口（适配删除/角色修改功能） ============
  // 获取用户列表（支持搜索）
  getAdminUserList: (keyword, token) => apiRequest('/admin/users', 'GET', keyword ? { keyword } : null, token),
  // 更新用户角色
  updateUserRole: (userId, role, token) => apiRequest(`/admin/users/${userId}/role`, 'PUT', { role }, token),
  // 删除用户
  deleteUser: (userId, token) => apiRequest(`/admin/users/${userId}`, 'DELETE', null, token)
};

window.api = api;
window.apiRequest = apiRequest;
window.createAbortController = () => new AbortController();
