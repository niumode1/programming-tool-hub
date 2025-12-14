// data-loader.js

/**
 * 从指定URL异步加载JSON数据
 * @param {string} url - JSON文件的相对路径
 * @returns {Promise<any>} Promise解析为JSON对象
 */
async function loadData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`加载数据失败 (${url}):`, error);
        throw error; // 重新抛出错误，让调用者处理
    }
}

/**
 * 加载所有软件数据
 * @returns {Promise<Array>} Promise解析为软件对象数组
 */
function loadTools() {
    return loadData('data/tools.json');
}

/**
 * 加载所有命令行数据
 * @returns {Promise<Object>} Promise解析为包含命令的对象
 */
function loadCommands() {
    return loadData('data/commands.json');
}

/**
 * 加载所有学习资源数据
 * @returns {Promise<Array>} Promise解析为资源对象数组
 */
function loadResources() {
    return loadData('data/resources.json');
}

// 导出函数 (如果在模块环境中)
// export { loadTools, loadCommands, loadResources };