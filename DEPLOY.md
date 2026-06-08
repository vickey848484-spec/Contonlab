# 部署 + SEO 一条龙指南

> 域名：**`www.canton-ai.com`**
> 托管：**Vercel**（已配 `vercel.json` + 4 个 SEO 文件 + 9 个 HTML 页面的 meta 标签）

---

## 📋 总览

| 任务 | 谁做 | 工作量 | 难度 |
|---|---|---|---|
| 1. Vercel 部署 + 域名绑定 | 你 | 30 分钟 | ⭐ |
| 2. Google Search Console 提交 sitemap | 你 | 15 分钟 | ⭐ |
| 3. 百度站长平台提交 sitemap | 你 | 20 分钟 | ⭐⭐ |
| 4. OG 预览测试 | 我帮你做 | 5 分钟 | ⭐ |

**预计总时间**：1.5-2 小时（大部分是等 DNS 生效 + 登平台操作）

---

## 1. Vercel 部署 + 域名绑定

### 1.1 准备代码（已完成 ✓）

- `vercel.json` 已配（headers + cron + cache）
- 9 个 HTML + 4 个 SEO 文件 + OG 图
- 默认语言 `zh-HK`（港式繁体）

### 1.2 创建 Vercel 项目

1. 打开 https://vercel.com/new
2. **Import Git Repository**（推荐）
   - 把代码推到 GitHub（如果还没）
   - Vercel → "Add New Project" → 选你的 repo
3. **配置**：
   - Framework Preset: **Other**（纯静态）
   - Build Command: 留空
   - Output Directory: 留空（默认根目录）
4. 点 **Deploy**（首次部署约 1-2 分钟）

### 1.3 绑定 `www.canton-ai.com` 域名

1. 项目页面 → **Settings** → **Domains**
2. 输入 `www.canton-ai.com` → 点 **Add**
3. Vercel 会显示需要添加的 DNS 记录：

| 类型 | 名称 | 值 |
|---|---|---|
| CNAME | www | `cname.vercel-dns.com` |

4. **去你的域名注册商**（如 GoDaddy / Namecheap / 阿里云）
   - 找到 `www.canton-ai.com` 的 DNS 设置
   - 添加上面的 CNAME 记录
5. 回到 Vercel，**等 DNS 验证**（通常 5-30 分钟）
6. 验证成功后，Vercel 自动签发 **SSL 证书**（Let's Encrypt，免费）

### 1.4 也加根域名（推荐）

1. 同样在 Vercel Domains 加 `canton-ai.com`（不带 www）
2. 域名注册商添加：
   | 类型 | 名称 | 值 |
   |---|---|---|
   | A | @ | `76.76.21.21` |
3. 在 Vercel 把 `www.canton-ai.com` 设为 **primary**（canonical）
4. 在 `vercel.json` 加 redirect：`canton-ai.com/*` → `www.canton-ai.com/*`

### 1.5 验证

```bash
curl -I https://www.canton-ai.com/
# 应返回 200 + Vercel headers
```

---

## 2. Google Search Console 提交

### 2.1 注册 + 验证域名

1. 打开 https://search.google.com/search-console
2. **Add Property** → 选 **URL prefix** → 输入 `https://www.canton-ai.com/`
3. 选验证方式：**HTML tag**（最简单）
4. 复制 Google 给你的 meta tag，类似：
   ```html
   <meta name="google-site-verification" content="xxxxxx" />
   ```
5. 加到 `index.html` 的 `<head>` 里
6. 重新部署
7. 回 GSC 点 **Verify**

### 2.2 提交 sitemap

1. GSC 左侧菜单 → **Sitemaps**
2. 输入 `https://www.canton-ai.com/sitemap.xml`
3. 点 **Submit**
4. 等几分钟，状态显示 **Success**（可能有 1-2 个警告，可忽略）

### 2.3 请求索引（加速收录）

1. 左侧 → **URL Inspection**
2. 输入 `https://www.canton-ai.com/` → 点 **Request Indexing**
3. 再输入 `https://www.canton-ai.com/qa.html`（FAQ 优先收录）
4. 再输入 `https://www.canton-ai.com/research.html`（长内容）
5. 每天最多 10-12 个 URL

### 2.4 提交后等多久？

- 收录：3-7 天
- 排名：2-4 周开始有数据
- FAQ rich result：1-3 周

---

## 3. 百度站长平台

### ⚠️ 重要前提

**百度收录国内访问的网站需要 ICP 备案**。如果你的服务器在境外（如 Vercel 用的是 AWS Global），**百度对境外站收录慢且排名差**。

**两个选择**：
- **A**（推荐）：先主要做 Google + Bing，**百度只做辅助**（也提交但不期待短期效果）
- **B**：把网站搬到**国内服务器**（阿里云/腾讯云），做 ICP 备案（约 7-20 天），百度收录会好

### 3.1 注册百度站长平台

1. 打开 https://ziyuan.baidu.com
2. 用百度账号登录
3. **站点管理** → **添加网站** → 输入 `https://www.canton-ai.com/`
4. 选验证方式：**HTML meta 标签** 或 **CNAME 解析**
5. 复制验证代码，加到 `index.html` 的 `<head>`
6. 重新部署
7. 验证通过

### 3.2 提交 sitemap

1. 左侧 → **普通收录** → **sitemap**
2. 输入 `https://www.canton-ai.com/sitemap.xml`
3. 点 **提交**

### 3.3 链接提交（API 主动推送，重要！）

百度对 sitemap 反应慢。**主动推送**每天最新链接能让收录快 10x：

```bash
curl -H 'User-Agent: curl/7.0' \
  "https://data.zz.baidu.com/urls?site=https://www.canton-ai.com&token=YOUR_TOKEN"
  -d "https://www.canton-ai.com/"
  -d "https://www.canton-ai.com/test.html"
  -d "https://www.canton-ai.com/qa.html"
```

**但 token 需要在百度站长后台拿**（链接提交 → 主动推送 → 接口调用地址里有 token）

### 3.4 百度资源平台注意事项

- **百度搜索资源平台** ≠ **百度站长平台**（前者 ziyuan.baidu.com，后者 zhanzhang.baidu.com）
- 推荐用 ziyuan.baidu.com（新版）
- 移动适配要做（百度重视移动端）

---

## 4. OG 预览测试

我帮你做这个（不用你登账号）。

### 4.1 工具链接

| 平台 | 测试地址 | 备注 |
|---|---|---|
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | 需 FB 开发者账号 |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | 需 X 开发者账号 |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ | 需 LinkedIn 账号 |
| 通用 OG 预览 | https://www.opengraph.xyz/ | 不用登账号 |

### 4.2 测试方法

1. 等域名生效（1.2 完成）
2. 把每个页面的 URL 贴进上述任一工具
3. 看预览：
   - ✓ OG 图是否显示（应显示 1200×630 黑黄品牌图）
   - ✓ 标题/描述是否正确
   - ✓ locale 是否 zh_HK

### 4.3 我已经做了基础验证

让我先跑一遍 curl 看 meta 标签是否齐全：

```bash
curl -s https://www.canton-ai.com/ | grep -E "og:|twitter:|canonical"
```

---

## 5. 部署后第一次必做

1. **冒烟测试**：
   ```bash
   curl -I https://www.canton-ai.com/         # 200
   curl -I https://www.canton-ai.com/qa.html  # 200
   curl -I https://www.canton-ai.com/sitemap.xml  # 200
   curl -I https://www.canton-ai.com/robots.txt   # 200
   ```

2. **三语切换测试**：浏览器切到「繁/简/EN」三个 tab，看是否都正常

3. **完整测试流程**：
   - 首页 → 点「测一测」→ 答题 → 看结果
   - 结果页 → 切换到英文 → 看是否全英
   - 留邮箱 → 验证表单

---

## 6. 后续优化（第一周内）

- [ ] 申请 **Google AdSense**（让 Google 索引 + 变现）
- [ ] 加 **Web Vitals 监控**（Vercel Speed Insights）
- [ ] 注册 **Bing Webmaster Tools**（Bing 也用 sitemap）
- [ ] 在 `data/i18n.json` 加更多语言（如果目标市场有）：ja-JP, ko-KR

---

## 7. 文件清单（部署需要包含的）

```
.
├── index.html
├── test.html
├── result.html
├── partner.html
├── course.html
├── signup.html
├── qa.html
├── about.html
├── research.html
├── api/
│   ├── subscribe.js
│   └── push-reminder.js
├── css/
│   └── style.css
├── js/
│   ├── common.js
│   ├── quiz.js
│   ├── labeler.js
│   ├── calc.js
│   ├── share.js
│   └── analytics.js
├── data/
│   ├── questions.json
│   ├── partners.json
│   ├── courses.json
│   ├── labels.json
│   ├── i18n.json
│   └── (qa.json 已删)
├── images/
│   ├── avatar.jpg
│   └── og-image.svg  ← OG 分享预览图
├── sitemap.xml      ← SEO
├── robots.txt       ← SEO
├── vercel.json      ← Vercel 配置
└── README.md
```

---

## 8. 我能立刻做的（不需你操作）

- [x] 写好 vercel.json（headers + cron + cache）
- [x] 写好 sitemap.xml（9 页 + 3 语言）
- [x] 写好 robots.txt
- [x] 写好 og-image.svg
- [x] 9 个 HTML 页面 SEO meta 完整
- [x] 域名全部换成 `www.canton-ai.com`
- [ ] 跑 curl 验证 OG 标签齐全（下面执行）

---

## 9. 我现在跑一遍 OG 验证