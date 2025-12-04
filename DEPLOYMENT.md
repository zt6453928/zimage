# 部署指南

本项目支持部署到GitHub Pages，以下是完整的部署步骤。

## GitHub Pages 部署步骤

### 1. 推送到GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

### 2. 启用GitHub Pages
1. 访问你的GitHub仓库：`https://github.com/zt6453928/zimage`
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 下拉菜单中选择 **Deploy from a branch**
5. 在 **Branch** 下拉菜单中选择 **gh-pages**
6. 点击 **Save**

### 3. 配置API密钥
由于安全考虑，API密钥不会被提交到Git仓库。你需要在GitHub上手动创建配置文件：

1. 在GitHub仓库中，点击 **Add file** > **Create new file**
2. 文件名输入：`config.js`
3. 内容如下：
   ```javascript
   // Built-in API Key configuration
   // This file contains your API key for the application
   window.BUILT_IN_API_KEY = 'V5PWW7GYB8NOTZGQ6EEF4IJL3TIGXJF3YU2L371P';
   ```
4. 点击 **Commit new file**

### 4. 更新部署
每次修改源代码后，需要重新构建并推送到gh-pages分支：

```bash
# 构建项目
npm run build

# 切换到gh-pages分支
git checkout gh-pages

# 复制构建文件
cp -r dist/* .

# 确保config.js存在（重要！）
# 如果config.js不存在，从master分支复制
git checkout master -- config.js
cp config.js .

# 提交更改
git add .
git commit -m "Update deployment"

# 推送
git push origin gh-pages

# 回到master分支
git checkout master
```

### 5. 访问应用
部署完成后，你可以通过以下URL访问应用：
```
https://zt6453928.github.io/zimage/
```

## 本地开发

### 开发环境设置
```bash
# 安装依赖
npm install

# 创建config.js文件
cp config.example.js config.js
# 编辑config.js添加你的API密钥

# 启动开发服务器
npm run dev
```

### 生产构建
```bash
npm run build
npm run preview
```

## 安全注意事项

- `config.js` 文件包含敏感的API密钥，**不要提交到Git仓库**
- 定期检查API使用量，避免费用超支
- 考虑为生产环境使用专门的API密钥

## 故障排除

### 问题：显示"请输入API Key"
**解决方案**：
1. 确保 `config.js` 文件存在于项目根目录
2. 检查 `config.js` 中的API密钥是否正确
3. 清除浏览器缓存后重新加载页面

### 问题：GitHub Pages显示空白页面
**解决方案**：
1. 检查gh-pages分支是否正确设置
2. 确保所有构建文件都已推送到gh-pages分支
3. 等待5-10分钟让GitHub Pages完全部署

### 问题：API调用失败
**解决方案**：
1. 检查API密钥是否有效
2. 确认API配额充足
3. 检查网络连接
