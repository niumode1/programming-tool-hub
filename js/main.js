// main.js

/**
 * 创建一个软件卡片的DOM元素
 * @param {Object} tool - 软件对象
 * @returns {HTMLElement} - 代表软件卡片的div元素
 */
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';

    // 简化图标处理，如果没有图标则留空或使用默认占位符
    const iconSrc = tool.icon && tool.icon.trim() !== '' ? tool.icon : 'images/default-icon.png'; // 假设有个默认图标

    card.innerHTML = `
        <img src="${iconSrc}" alt="${tool.name} Icon">
        <h3><a href="detail.html?id=${tool.id}">${tool.name}</a></h3>
        <p>${tool.description.substring(0, 100)}${tool.description.length > 100 ? '...' : ''}</p>
        <div class="os-tags">
            ${tool.os.map(os => `<span class="os-tag">${os}</span>`).join('')}
        </div>
    `;
    return card;
}

// --- 新增或修改的函数 ---

/**
 * 从工具数组中提取唯一的类别和语言
 * @param {Array} tools - 软件对象数组
 */
function populateFilters(tools) {
    const types = new Set();
    const languages = new Set();

    tools.forEach(tool => {
        if (tool.category) {
            tool.category.forEach(cat => types.add(cat));
        }
        if (tool.languages) {
            tool.languages.forEach(lang => languages.add(lang));
        }
    });

    const typeSelect = document.getElementById('type-filter');
    const langSelect = document.getElementById('lang-filter');

    // 清空旧选项
    typeSelect.innerHTML = '<option value="">全部</option>';
    langSelect.innerHTML = '<option value="">全部</option>';

    // 填充新选项
    [...types].sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });

    [...languages].sort().forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        langSelect.appendChild(option);
    });
}

/**
 * 根据当前所有筛选条件过滤工具列表
 * @param {Array} tools - 完整的软件对象数组
 * @returns {Array} - 过滤后的软件对象数组
 */
function applyFilters(tools) {
    const osFilter = document.getElementById('os-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const langFilter = document.getElementById('lang-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const searchTerm = document.getElementById('search-box').value.toLowerCase();

    return tools.filter(tool => {
        // 操作系统筛选
        if (osFilter && !tool.os.includes(osFilter)) return false;

        // 类型筛选
        if (typeFilter && !(tool.category && tool.category.includes(typeFilter))) return false;

        // 语言筛选
        if (langFilter && !(tool.languages && tool.languages.includes(langFilter))) return false;

        // 价格筛选 (简单匹配)
        if (priceFilter && tool.pricing !== priceFilter) return false;

        // 搜索词筛选 (名称和描述)
        if (searchTerm &&
            !tool.name.toLowerCase().includes(searchTerm) &&
            !tool.description.toLowerCase().includes(searchTerm)) {
            return false;
        }

        return true;
    });
}

/**
 * 显示给定的工具列表到页面上
 * @param {Array} toolsToShow - 要显示的软件对象数组
 */
function displayTools(toolsToShow) {
     const grid = document.getElementById('all-tools-grid');
     // 注意：此函数假定目标容器是 #all-tools-grid
     // 如果需要更通用，可以传递容器ID或元素作为参数
     if (!grid) {
         console.warn('displayTools: 找不到 ID 为 all-tools-grid 的元素');
         return;
     }
     grid.innerHTML = ''; // 清空现有内容
     if (toolsToShow.length === 0) {
         grid.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">没有找到匹配的工具。</p>';
         return;
     }
     toolsToShow.forEach(tool => {
        const toolCard = createToolCard(tool);
        grid.appendChild(toolCard);
     });
}


// --- 通用函数或事件监听器 ---
document.addEventListener('DOMContentLoaded', function () {

    // --- 移除了首页逻辑 ---

    // --- 软件库页面逻辑 ---
    if (document.getElementById('all-tools-grid')) { // 检查是否在软件库页面
        // 假设 loadTools 是一个全局函数，返回 Promise
        if (typeof loadTools !== 'function') {
             console.error('loadTools 函数未定义。请确保相关数据加载逻辑已引入。');
             return;
        }
        let allToolsCache = []; // 缓存所有工具数据

        loadTools().then(tools => {
            allToolsCache = tools;
            populateFilters(tools); // 填充类型和语言下拉框
            displayTools(tools); // 初始显示所有工具

            // 为所有筛选器和搜索框添加事件监听
            const filters = ['os-filter', 'type-filter', 'lang-filter', 'price-filter'];
            filters.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                     element.addEventListener('change', () => {
                        displayTools(applyFilters(allToolsCache));
                    });
                } else {
                    console.warn(`未找到筛选器元素: #${id}`);
                }
            });
            const searchBox = document.getElementById('search-box');
            if (searchBox) {
                 searchBox.addEventListener('input', () => {
                     displayTools(applyFilters(allToolsCache));
                 });
            } else {
                 console.warn('未找到搜索框元素: #search-box');
            }

        }).catch(error => {
            console.error('加载工具失败:', error);
            const grid = document.getElementById('all-tools-grid');
            if (grid) {
                grid.innerHTML = '<p>加载工具失败。</p>';
            }
        });
    }

    // --- 命令行助手页面逻辑 ---
    // (这部分逻辑已在 commands.html 内部脚本中处理)

    // --- 学习资源页面逻辑 ---
    // (这部分逻辑已在 resources.html 内部脚本中处理)

    // --- 导航栏高亮逻辑 ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        // 移除所有现有的 active 类
        link.classList.remove('active');

        // 检查链接的 href 是否匹配当前页面
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

// --- 可以在这里暴露一些全局函数供其他页面的内联脚本调用 ---
window.createToolCard = createToolCard;
// 可选：如果其他地方也需要调用这些函数
// window.populateFilters = populateFilters;
// window.applyFilters = applyFilters;
// window.displayTools = displayTools;