/* ============================================================
 * analytics.js — Vercel Web Analytics + 百度统计
 * ------------------------------------------------------------
 * 配置说明：
 *   1. Vercel Web Analytics（推荐先开）
 *      - 部署到 Vercel 后，在项目 Settings → Analytics → Enable
 *      - 本地 http server 下不会跑（Vercel 专属路径），无需担心
 *
 *   2. 百度统计（地域/用户画像最准，国内必装）
 *      - 注册 https://tongji.baidu.com → 添加网站 → 拿到 hm.js? 后面的 ID
 *      - 把下面 CONFIG.baiduTongjiId 替换成你的 ID
 *      - 把 CONFIG.enableBaidu 改成 true
 *      - 一般次日早上登录 https://tongji.baidu.com 即可看到数据
 * ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    // ↓↓↓ 替换成你的百度统计 ID（约 32 位字符）↓↓↓
    baiduTongjiId: 'YOUR_BAIDU_TONGJI_ID',
    enableVercel: true,                            // 关掉可停用 Vercel Analytics
    enableBaidu: false,                            // 填好 ID 后改成 true
  };

  // ---------- 1. Vercel Web Analytics ----------
  if (CONFIG.enableVercel) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    s.onerror = () => {/* 本地 dev 时 404 是正常的，吞掉 */};
    document.head.appendChild(s);
  }

  // ---------- 2. 百度统计 ----------
  if (CONFIG.enableBaidu && CONFIG.baiduTongjiId !== 'YOUR_BAIDU_TONGJI_ID') {
    window._hmt = window._hmt || [];
    const hm = document.createElement('script');
    hm.async = true;
    hm.src = 'https://hm.baidu.com/hm.js?' + CONFIG.baiduTongjiId;
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  } else if (CONFIG.enableBaidu) {
    console.warn('[analytics] 百度统计已 enable 但 ID 未填，请编辑 js/analytics.js 填入 baiduTongjiId');
  }
})();
