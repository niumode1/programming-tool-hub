# CodeStart Hub - 编程工具导航站

CodeStart Hub 是一个专为编程初学者和开发者设计的工具导航网站，旨在提供一个简洁、高效、一站式的平台，帮助用户轻松发现、了解和获取所需的编程软件和资源。

## 项目概述

该网站汇集了各类编程工具、命令行指南和学习资源，主要功能包括：

- 全面的软件库：收录主流编程工具，提供下载、安装、配置指南
- 跨平台支持：明确标注各软件对 Windows, macOS, Linux 的支持情况
- 命令行助手：查询常用系统命令和 Git 等工具操作
- 精选学习资源：推荐优质的编程学习网站和平台

## 技术架构
- 前端：原生 HTML/CSS/JavaScript，无框架轻量化设计，适配多端
- 后端：Node.js + Express，提供 RESTful API 接口
- 数据库：MySQL，存储用户信息、推荐软件、审核状态等动态数据
- 权限控制：基于 JWT 的 Token 认证，区分普通用户 / 管理员权限

## 网站结构

```
CodeStart_hub/
├── admin/                     # 管理员功能模块
│   ├── dashboard.html         # 管理员首页
│   ├── login.html             # 管理员登录页
│   ├── software-review.html   # 软件审核页
│   ├── approved-software.html # 软件已审核通过页
│   └── user-management.html   # 用户管理页（含删除/角色修改）
├── backend/                   # 后端服务模块
│   ├── config/
│   │   └── db.js              # 数据库配置
│   ├── node_modules/          # 后端依赖包
│   ├── routes/
│   │   └── recommend.js       # 软件推荐接口路由
│   ├── .env                   # 环境变量配置
│   ├── authMiddleware.js      # 登录权限验证中间件
│   ├── package.json           # 后端依赖配置
│   ├── package-lock.json
│   └── server.js              # 后端服务入口
├── css/                       # 样式文件
│   ├── auth-style.css         # 登录/注册样式
│   └── style.css              # 全局样式
├── data/                      # 静态数据文件
│   ├── commands.json          # 命令行助手数据
│   ├── resources.json         # 学习资源数据
│   └── tools.json             # 软件工具数据
├── images/                    # 图片资源
├── js/                        # 前端脚本
│   ├── api.js                 # 接口请求封装
│   ├── auth.js                # 登录/注册逻辑
│   ├── data-loader.js         # 静态数据加载工具
│   └── main.js                # 全局交互逻辑
├── .gitignore                 # Git忽略文件
├── about.html                 # 关于页面
├── commands.html              # 命令行助手页面
├── detail.html                # 软件详情页
├── donate.html                # 捐赠页面
├── index.html                 # 首页
├── LICENSE.txt                # 许可文件
├── login.html                 # 用户登录页
├── README.md                  # 项目说明
├── register.html              # 用户注册页
├── resources.html             # 学习资源页面
├── software.html              # 软件库页面
└── user-dashboard.html        # 用户中心（软件推荐）
```

## 核心功能说明

### 1.普通用户功能
- 账号体系：注册 / 登录账号，基于 Token 保持登录状态
- 软件推荐：在用户中心提交新工具推荐（名称 / 链接 / 描述 / 支持系统）
- 资源浏览：查看软件库、命令行助手、学习资源等核心内容
### 2. 管理员功能
- 权限验证：专属管理员登录入口，需管理员角色 Token
- 软件审核：查看待审核的用户推荐，支持通过 / 驳回操作
- 用户管理：查看所有用户列表、修改用户角色（普通用户 / 管理员）、删除违规用户
### 3. 公共功能
- 软件库：按分类展示工具，支持按系统 / 类型筛选，查看详细介绍
- 命令行助手：按操作系统 / 工具分类查询常用命令
- 学习资源：按类型（文档 / 视频 / 社区）展示编程学习资源

## 主要功能页面

1. **首页**：展示热门工具和网站导航
2. **软件库**：按分类展示各类编程工具，支持搜索和筛选
3. **命令行助手**：按操作系统和工具分类展示常用命令
4. **学习资源**：精选编程学习网站和平台
5. **软件详情页**：展示特定工具的详细信息，包括安装教程和配置指南

## 数据结构

- **工具数据**（tools.json）：包含工具名称、描述、官网链接、下载链接、支持系统、分类、价格、安装指南等信息
- **命令数据**（commands.json）：按操作系统和工具分类组织的命令列表，包含命令和描述
- **资源数据**（resources.json）：学习资源的名称、描述、链接和分类

## 使用说明
## 
###环境要求
 - 前端：现代浏览器（Chrome/Firefox/Edge 等）
 - 后端：Node.js 14+、MySQL 8.0+
 - 端口：前端静态访问（任意），后端服务默认 3001 端口
 - 部署步骤

###克隆项目
```
git clone [项目仓库地址]
cd CodeStart_hub
```

###后端部署
```
# 进入后端目录
cd backend
# 安装依赖
npm install
# 配置.env文件（数据库连接/密钥等）
# 示例.env内容：
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=你的数据库密码
# DB_NAME=codestart_hub
# JWT_SECRET=你的密钥
# PORT=3001
# 启动后端服务
node server.js
```
###数据库初始化
 - 创建数据库 codestart_hub
 - 执行以下 SQL 创建核心表：
```
-- 用户表
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 软件推荐表
CREATE TABLE tool_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  os TEXT NOT NULL,
  recommender_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recommender_id) REFERENCES users(id)
);
-- 审核通过软件推荐表
CREATE TABLE `tools` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '工具ID',
  `name` VARCHAR(255) NOT NULL COMMENT '工具名称',
  `description` TEXT COMMENT '工具描述',
  `officialUrl` VARCHAR(255) COMMENT '官方链接',
  `downloadUrl` VARCHAR(255) COMMENT '下载链接',
  `os` JSON COMMENT '支持的操作系统（如["Windows","MacOS"]）',
  `category` JSON COMMENT '工具分类（如["用户推荐"]）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 进入1.31版本后端目录
cd /var/www/CodeStart_hub_1.31/backend  # 进入1.31版本后端目录

pm2 start server.js --name codestart_hub_1.31  # 用pm2启动（命名为codestart_hub_1.31，区分旧版本）

pm2 status codestart_hub_1.31  # 查看状态

pm2 startup  #生成 pm2 自启服务

pm2 save  #保存为启动项

### 前端访问
直接用浏览器打开项目根目录的 index.html
管理员后台访问 admin/login.html

## 贡献指南

如果您想为该项目贡献内容：

1. 可以通过添加新的工具、命令或学习资源
2. 发现错误或有改进建议，欢迎提交 Issue

## 联系方式

如有任何建议、反馈或发现问题，请通过以下方式联系：
- 邮箱: niumode1@outlook.com

## 免责声明

本网站仅提供软件信息索引，所有软件的版权归其 respective holders 所有。下载链接均指向官方或可信来源，但我们不对下载内容的安全性或合法性负责。

## 许可证

本项目采用 MIT 许可证开源，详情如下：
```
MIT License
Copyright (c) 2025 Xiao shouzheng
Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the "Software"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sellcopies of the Software, and to permit persons to whom the Software isfurnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in allcopies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS ORIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THESOFTWARE.
plaintext
```

亦可查看项目根目录下的 [LICENSE](LICENSE) 文件获取完整许可证文本。

