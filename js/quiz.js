/* ============================================================
 * quiz.js — 水平測試 + MBTI + 倒計時加載
 * ============================================================ */
(function (global) {
  'use strict';

  const { Store, loadJSON, getLevelByScore, confetti, getQuery } = global.Cantonese;

  let DATA = null;
  let state = null;

  function defaultState() {
    return {
      step: 0,
      levelAnswers: [],
      mbtiAnswers: [],
      levelScore: 0,
      level: null,
      mbtiCode: '',
      mbtiType: null,
      user: null,
    };
  }

  function restore() {
    const saved = Store.get(Store.KEYS.quiz);
    if (saved && typeof saved === 'object') {
      state = Object.assign(defaultState(), saved);
    } else {
      state = defaultState();
    }
  }

  function persist() { Store.set(Store.KEYS.quiz, state); }

  function getQuestionList() {
    if (!DATA) return [];
    return [...DATA.levelQuestions, ...DATA.mbtiQuestions];
  }
  function isMBTI(index) {
    return index >= DATA.levelQuestions.length;
  }

  function calcMBTICode() {
    if (!DATA) return '';
    // 字母映射必須跟 data/labels.json 裏的 16 個 type key 完全一致
    //   speed:  S=速成  M=慢熱
    //   learn:  P=聽講  T=傾偈
    //   social: T=社交  W=獨狼
    //   style:  I=學院  E=野生
    const dims = { speed: ['S', 'M'], learn: ['P', 'T'], social: ['T', 'W'], style: ['I', 'E'] };
    const picks = { speed: 0, learn: 0, social: 0, style: 0 };
    DATA.mbtiQuestions.forEach((q, i) => {
      const ans = state.mbtiAnswers[i];
      if (ans === 0) picks[q.dimension] = 0;
      if (ans === 1) picks[q.dimension] = 1;
    });
    return dims.speed[picks.speed] + dims.learn[picks.learn] +
           dims.social[picks.social] + dims.style[picks.style];
  }

  function finalize() {
    if (!DATA) return null;
    state.levelScore = state.levelAnswers.reduce(
      (s, a, i) => s + (a === DATA.levelQuestions[i].answer ? 1 : 0), 0
    );
    state.level = getLevelByScore(state.levelScore, DATA.levelQuestions.length);
    state.mbtiCode = calcMBTICode();
    return state;
  }

  function renderQuestion(container) {
    const list = getQuestionList();
    const total = list.length;
    const idx = state.step;
    const q = list[idx];
    if (!q) return renderUserForm(container);

    const pct = Math.round((idx / total) * 100);
    const isMbti = isMBTI(idx);
    const ans = isMbti ? state.mbtiAnswers[idx - DATA.levelQuestions.length]
                       : state.levelAnswers[idx];

    container.innerHTML = `
      <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="question-card">
        <span class="question-num">
          ${Cantonese.t(isMbti ? 'test.mb-test' : 'test.lv-test')} ·
          ${Cantonese.t('test.q-num', undefined, idx + 1, total)}
          ${q.category ? ` · ${Cantonese.pick(q.category)}` : ''}
        </span>
        <div class="question-text">${Cantonese.pick(q.question)}</div>
        <div class="options">
          ${Cantonese.pick(q.options).map((opt, i) => `
            <button class="option" data-i="${i}">${opt}</button>
          `).join('')}
        </div>
        <div class="row mt-3" style="justify-content: space-between;">
          ${idx > 0 ? `<button class="btn btn-ghost" id="prev">${Cantonese.t('test.prev')}</button>` : '<span></span>'}
          <span class="text-sm muted" id="progress-text">${idx + 1} / ${total}</span>
        </div>
      </div>
    `;

    container.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.i, 10);
        if (isMbti) {
          state.mbtiAnswers[idx - DATA.levelQuestions.length] = i;
        } else {
          state.levelAnswers[idx] = i;
        }
        persist();
        setTimeout(() => {
          state.step++;
          persist();
          if (state.step >= total) {
            renderUserForm(container);
          } else {
            renderQuestion(container);
          }
        }, 200);
      });
    });

    const prev = container.querySelector('#prev');
    if (prev) prev.addEventListener('click', () => {
      state.step = Math.max(0, state.step - 1);
      persist();
      renderQuestion(container);
    });
  }

  function renderUserForm(container) {
    const T = Cantonese.t;
    container.innerHTML = `
      <div class="question-card">
        <span class="question-num">${T('test.user-title')}</span>
        <div class="question-text">${T('test.user-q')}</div>

        <div class="stack">
          <div class="field">
            <label>${T('test.age')}</label>
            <select class="select" id="age">
              <option value="u18">${T('test.opt.u18')}</option>
              <option value="18-25" selected>${T('test.opt.18-25')}</option>
              <option value="26-35">${T('test.opt.26-35')}</option>
              <option value="36-50">${T('test.opt.36-50')}</option>
              <option value="50+">${T('test.opt.50+')}</option>
            </select>
          </div>

          <div class="field">
            <label>${T('test.gender')}</label>
            <select class="select" id="gender">
              <option value="f">${T('test.opt.f')}</option>
              <option value="m">${T('test.opt.m')}</option>
              <option value="o">${T('test.opt.o')}</option>
            </select>
          </div>

          <div class="field">
            <label>${T('test.region')}</label>
            <select class="select" id="region">
              <option value="native">${T('test.opt.native')}</option>
              <option value="exposed" selected>${T('test.opt.exposed')}</option>
              <option value="zero">${T('test.opt.zero')}</option>
            </select>
          </div>

          <div class="field">
            <label>${T('test.minutes')}</label>
            <select class="select" id="minutes">
              <option value="15">${T('test.opt.15')}</option>
              <option value="30" selected>${T('test.opt.30')}</option>
              <option value="60">${T('test.opt.60')}</option>
              <option value="90">${T('test.opt.90')}</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg mt-3" id="submit">${T('test.btn-show')}</button>
      </div>
    `;

    container.querySelector('#submit').addEventListener('click', () => {
      const u = {
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        region: document.getElementById('region').value,
        minutes: parseInt(document.getElementById('minutes').value, 10),
      };
      state.user = u;
      Store.set(Store.KEYS.user, u);
      finalize();
      persist();
      const referredBy = Store.get('cantonese_referred_by') || null;
      const result = {
        level: state.level,
        levelScore: state.levelScore,
        levelTotal: DATA.levelQuestions.length,
        mbtiCode: state.mbtiCode,
        user: { ...u, referredBy },
        timestamp: Date.now(),
      };
      Store.set(Store.KEYS.result, result);
      // 測完後清掉 ref（避免影響下次測試）
      Store.remove('cantonese_referred_by');
      confetti(document.body, 40);
      showLoading(container, () => { location.href = 'result.html'; });
    });
  }

  // 倒計時加載（1.8 秒完成 → 跳轉；用户可点跳过）
  function showLoading(container, onDone) {
    const T = Cantonese.t;
    const stages = [
      { icon: 'magnifying-glass', text: T('test.stage-1'), duration: 380 },
      { icon: 'calculator',        text: T('test.stage-2'), duration: 380 },
      { icon: 'dna',               text: T('test.stage-3'), duration: 420 },
      { icon: 'funnel',            text: T('test.stage-4'), duration: 380 },
      { icon: 'rocket',            text: T('test.stage-5'), duration: 280 },
    ];
    const total = stages.reduce((s, st) => s + st.duration, 0); // ~1840ms
    const totalSec = (total / 1000).toFixed(1);

    container.innerHTML = `
      <div class="question-card" style="min-height: 380px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px 24px;">
        <div style="font-size: 80px; line-height: 1; margin-bottom: 24px; color: var(--blue);" id="loading-icon"></div>
        <div class="display" style="font-size: 22px; margin-bottom: 32px; max-width: 320px; min-height: 30px;" id="loading-text">${T('test.stage-1')}</div>
        <div style="width: 100%; max-width: 320px;">
          <div class="progress"><div class="progress-fill" id="loading-bar" style="width: 0%"></div></div>
        </div>
        <div class="muted text-sm mt-2">
          ${Cantonese.t('test.countdown', undefined, totalSec).replace(totalSec, `<span id="loading-eta">${totalSec}</span>`)}
        </div>
        <button class="btn btn-ghost mt-3" id="loading-skip">${T('test.loading-skip')}</button>
      </div>
    `;

    // 渲染圖標
    const iconHost = container.querySelector('#loading-icon');
    iconHost.innerHTML = global.Cantonese.icon(stages[0].icon);

    const bar  = container.querySelector('#loading-bar');
    const text = container.querySelector('#loading-text');
    const eta  = container.querySelector('#loading-eta');

    let elapsed = 0;
    let i = 0;

    function tick() {
      if (i >= stages.length) {
        // 強制 100%
        bar.style.width = '100%';
        // 立即跳轉（不等動畫）
        onDone();
        return;
      }
      const stage = stages[i];
      text.textContent = stage.text;
      iconHost.innerHTML = global.Cantonese.icon(stage.icon);
      elapsed += stage.duration;
      const pct = Math.min(100, (elapsed / total) * 100);
      bar.style.width = pct + '%';
      eta.textContent = Math.max(0, ((total - elapsed) / 1000).toFixed(1));
      i++;
      setTimeout(tick, stage.duration);
    }

    setTimeout(tick, 50);
    confetti(document.body, 30);

    // 跳过按钮：用户想立即看结果时点
    const skipBtn = container.querySelector('#loading-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => onDone());
  }

  async function init(container) {
    if (!DATA) DATA = await loadJSON('data/questions.json');
    restore();

    // 重新測一次（帶 ?restart=1）或郵件迴流（?ref=reminder）→ 重置 state
    if (getQuery('restart') === '1' || getQuery('ref') === 'reminder') {
      state = defaultState();
      state.user = Store.get(Store.KEYS.user) || null;
      persist();
      // 清掉 URL 參數，避免刷新再次重置
      const url = new URL(location.href);
      url.searchParams.delete('restart');
      url.searchParams.delete('ref');
      history.replaceState(null, '', url.toString());
    }

    if (state.step >= DATA.levelQuestions.length + DATA.mbtiQuestions.length) {
      renderUserForm(container);
    } else {
      renderQuestion(container);
    }
  }

  global.Quiz = { init, finalize, restore, state: () => state };
})(window);
