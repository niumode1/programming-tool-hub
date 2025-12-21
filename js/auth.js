// 处理登录
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // 调用后台登录接口（实际开发需替换为真实接口）
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            // 存储登录状态到localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // 跳转到首页或用户中心
            window.location.href = 'index.html';
        } else {
            alert('登录失败：' + data.message);
        }
    } catch (error) {
        console.error('登录请求失败', error);
    }
});

// 处理注册（类似逻辑）
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    // 验证密码一致性
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (password !== confirm) {
        alert('两次密码不一致');
        return;
    }
    // 调用注册接口...
});