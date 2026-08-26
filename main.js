fetch('/data.json')
  .then(r => r.json())
  .then(d => {
    renderSidebar(d);
    if (document.getElementById('hero')) renderHome(d);
    if (document.getElementById('projects-grid')) renderProjects(d);
    if (document.getElementById('experience-list')) renderExperience(d);
    if (document.getElementById('skills-page')) renderSkillsPage(d);
    if (document.getElementById('tools-picker-grid')) renderToolsPicker(d);
    if (d.stats.some(s => s.github)) fetchGithubStats();
    initScrollAnimations();
  });

function typeText(el, text, speed) {
  let i = 0;
  function tick() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, speed);
    } else {
      const cursor = document.querySelector('.typed-cursor');
      if (cursor) cursor.classList.add('typed-cursor--done');
    }
  }
  tick();
}

function fetchGithubStats() {
  fetch('https://api.github.com/users/EyosiyasBT')
    .then(r => r.json())
    .then(gh => {
      document.querySelectorAll('[data-github]').forEach(el => {
        el.textContent = gh.public_repos;
      });
    })
    .catch(() => {});
}

function renderSidebar(d) {
  const s = document.getElementById('sidebar-data');
  if (!s) return;

  const sidebarSkillNames = ['Problem Solving', 'Python', 'SQL', 'Data Engineering', 'Data Science'];
  const sidebarSkills = sidebarSkillNames.map(n => d.skills.find(sk => sk.name === n)).filter(Boolean);

  s.innerHTML = `
    <div class="avatar">${d.name[0]}</div>
    <div class="sidebar-name">${d.name}</div>
    <div class="sidebar-title">${d.title}</div>
    <hr class="sidebar-divider" />
    <table class="info-table">
      <tr><td>Location</td><td>${d.location}</td></tr>
      <tr><td>Status</td><td>${d.status}</td></tr>
      ${d.email ? `<tr><td>Email</td><td>${d.email}</td></tr>` : ''}
    </table>
    <hr class="sidebar-divider" />
    ${sidebarSkills.length ? `
      <div class="skills-label">Top Skills</div>
      ${sidebarSkills.map(sk => `
        <div class="skill-bar">
          <div class="skill-bar-top"><span>${sk.name}</span><span>${sk.level}/5</span></div>
          <div class="skill-bar-track"><div class="skill-bar-fill level-${sk.level}"></div></div>
        </div>`).join('')}
      <hr class="sidebar-divider" />
    ` : ''}
    <div class="social-links">
      <a href="${d.links.linkedin}">LinkedIn</a>
      <a href="${d.links.showcase}">ShowCase</a>
    </div>
  `;
}

function renderHome(d) {
  document.getElementById('hero').innerHTML = `
    <div class="hero-greeting">Hello, I'm</div>
    <h1>${d.name}<br /><span id="typed-title"><span id="typed-text"></span><span class="typed-cursor">|</span></span></h1>
    <p class="hero-sub">${d.bio}</p>
    <a href="${d.links.showcase}" class="hero-cta">View ShowCase</a>
  `;
  typeText(document.getElementById('typed-text'), d.title, 55);

  document.getElementById('stats').innerHTML = d.stats.map(s => {
    let value = s.value;
    if (s.github) value = `<span data-github>...</span>`;
    if (s.skills) value = d.skills.length || '...';
    return `
      <div class="stat-card">
        <div class="stat-number">${value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`;
  }).join('');

  renderProjectCards(d.projects.slice(0, 3), document.getElementById('projects-preview'), 3);
}

function renderProjects(d) {
  const live = d.projects.filter(p => p.type === 'live');
  const showcase = d.projects.filter(p => p.type === 'showcase');
  const container = document.getElementById('projects-grid');
  if (!container) return;

  container.innerHTML = `
    ${live.length ? `
      <div class="projects-section">
        <div class="projects-section-title">Live Projects</div>
        <div class="projects-section-sub">Interactive tools you can run directly in the browser</div>
        <div class="projects-grid-inner" id="live-grid"></div>
      </div>` : ''}
    <div class="projects-section">
      <div class="projects-section-title">Showcase</div>
      <div class="projects-section-sub">Projects to explore, read about, or run locally</div>
      <div class="projects-grid-inner" id="showcase-grid"></div>
    </div>
  `;

  if (live.length) renderProjectCards(live, document.getElementById('live-grid'), live.length);
  renderProjectCards(showcase, document.getElementById('showcase-grid'), showcase.length);
}

function renderProjectCards(projects, container, limit) {
  if (!container) return;
  container.innerHTML = projects.slice(0, limit).map((p, i) => {
    const tags = p.tags ? p.tags.map(t => `<span class="project-tag">${t}</span>`).join('') : '';
    const badge = p.type === 'live' ? `<span class="project-badge live">Live</span>` : '';
    const image = p.image ? `<div class="project-image"><img src="${p.image}" alt="${p.name} preview" loading="lazy" /></div>` : '';
    const inner = `${image}<div class="project-body">${badge}<h3>${p.name}</h3><p>${p.description}</p><div class="project-tags">${tags}</div></div>`;
    if (p.detail) {
      return `<div class="project-card${p.image ? ' project-card--image' : ''} project-card--clickable" data-detail-index="${i}">${inner}</div>`;
    }
    return p.url
      ? `<a href="${p.url}" class="project-card${p.image ? ' project-card--image' : ''}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="project-card${p.image ? ' project-card--image' : ''}">${inner}</div>`;
  }).join('');

  container.querySelectorAll('[data-detail-index]').forEach(el => {
    el.addEventListener('click', () => openProjectModal(projects[parseInt(el.dataset.detailIndex)]));
  });
}

function openProjectModal(p) {
  const overlay = document.getElementById('project-modal');
  const content = document.getElementById('project-modal-content');
  if (!overlay || !content) return;

  const images = p.detail.images ? p.detail.images.map(img => `
    <figure class="modal-figure">
      <img src="${img.src}" alt="${img.caption}" loading="lazy" />
      <figcaption>${img.caption}</figcaption>
    </figure>`).join('') : '';

  const tags = p.tags ? p.tags.map(t => `<span class="project-tag">${t}</span>`).join('') : '';

  content.innerHTML = `
    <button class="modal-close" id="modal-close-btn">&#x2715;</button>
    <div class="modal-title">${p.fullTitle ? p.fullTitle : p.name}</div>
    ${p.subtitle ? `<div class="modal-subtitle modal-thesis-sub">${p.subtitle}</div>` : ''}
    <div class="modal-subtitle">${tags}</div>
    <div class="modal-section-title">Abstract</div>
    <div class="modal-abstract">${p.detail.abstract}</div>
    ${images ? `<div class="modal-section-title">Figures</div><div class="modal-images">${images}</div>` : ''}
    ${p.url ? `<div class="modal-footer"><a href="${p.url}" class="modal-link" target="_blank" rel="noopener">View on GitHub →</a></div>` : ''}
  `;

  overlay.classList.add('open');
  document.getElementById('modal-close-btn').addEventListener('click', closeProjectModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeProjectModal(); });
  document.addEventListener('keydown', handleModalEsc);
}

function closeProjectModal() {
  const overlay = document.getElementById('project-modal');
  if (overlay) overlay.classList.remove('open');
  document.removeEventListener('keydown', handleModalEsc);
}

function handleModalEsc(e) {
  if (e.key === 'Escape') closeProjectModal();
}

function renderSkillsPage(d) {
  const categories = [...new Set(d.skills.map(s => s.category))];
  const labels = { 1: 'Exposed', 2: 'Developing', 3: 'Comfortable', 4: 'Proficient', 5: 'Mastered' };

  document.getElementById('skills-page').innerHTML = categories.map(cat => {
    const catSkills = [...d.skills.filter(s => s.category === cat)]
      .sort((a, b) => b.level - a.level);
    return `
      <section class="section">
        <div class="section-title">${cat}</div>
        <div class="skills-grid">
          ${catSkills.map(s => `
            <div class="skill-card">
              <div class="skill-card-top">
                <span class="skill-card-name">${s.name}</span>
                <span class="skill-card-label">${labels[s.level] || ''}</span>
              </div>
              <div class="skill-bar-track">
                <div class="skill-bar-fill level-${s.level}"></div>
              </div>
            </div>`).join('')}
        </div>
      </section>`;
  }).join('');
}

function renderExperience(d) {
  const expEl = document.getElementById('experience-list');
  if (expEl) {
    expEl.className = 'timeline-list';
    expEl.innerHTML = d.experience.map((e, i) => {
      const tags = e.tags ? e.tags.map(t => `<span class="project-tag">${t}</span>`).join('') : '';
      return `
        <div class="timeline-item${i === 0 ? ' timeline-item--open' : ''}" data-timeline>
          <div class="timeline-track">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div>
                <h3>${e.role}</h3>
                <div class="timeline-meta">${e.company} · ${e.period}</div>
              </div>
              <span class="timeline-chevron">&#9660;</span>
            </div>
            <div class="timeline-body">
              <p>${e.description}</p>
              ${tags ? `<div class="timeline-tags">${tags}</div>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    expEl.querySelectorAll('[data-timeline]').forEach(item => {
      item.querySelector('.timeline-header').addEventListener('click', () => {
        item.classList.toggle('timeline-item--open');
      });
    });
  }

  const eduEl = document.getElementById('education-list');
  if (eduEl) {
    eduEl.innerHTML = d.education.map(e => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>${e.degree}</h3>
          <div class="timeline-meta">${e.school} · ${e.period}</div>
          <p>${e.field}</p>
        </div>
      </div>`).join('');
  }

  const certEl = document.getElementById('certifications-list');
  if (certEl) {
    certEl.innerHTML = d.certifications.map(c => `
      <div class="cert-item">
        <span class="cert-name">${c.name}</span>
        <span class="cert-meta">${c.issuer}${c.date ? ' · ' + c.date : ''}</span>
      </div>`).join('');
  }

  const langEl = document.getElementById('languages-list');
  if (langEl) {
    langEl.innerHTML = d.languages.map(l => `
      <div class="cert-item">
        <span class="cert-name">${l.name}</span>
        <span class="cert-meta">${l.level}</span>
      </div>`).join('');
  }
}

function renderToolsPicker(d) {
  const grid = document.getElementById('tools-picker-grid');
  if (!grid) return;
  const tools = d.tools || [];
  grid.innerHTML = tools.map(t => `
    <div class="tool-picker-card" data-tool-id="${t.id}">
      <div class="tool-picker-icon">${t.icon}</div>
      <div class="tool-picker-name">${t.name}</div>
      <div class="tool-picker-desc">${t.description}</div>
      <div class="tool-picker-cta">Open Tool &rarr;</div>
    </div>`).join('');

  grid.querySelectorAll('.tool-picker-card').forEach(card => {
    card.addEventListener('click', () => openTool(card.dataset.toolId));
  });

  const closeBtn = document.getElementById('tool-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeToolModal);
}

function openTool(toolId) {
  const overlay = document.getElementById('tool-modal');
  if (!overlay) return;

  document.querySelectorAll('#tool-modal-content > [id]').forEach(el => el.classList.add('hidden'));
  const toolEl = document.getElementById(toolId + '-modal');
  if (toolEl) toolEl.classList.remove('hidden');

  const content = document.getElementById('tool-modal-content');
  if (content) content.classList.toggle('modal--wide', toolId === 'scoresheet-tool' || toolId === 'spinner-tool');

  overlay.classList.add('open');

  if (toolId === 'sickness-tool') initSicknessTool();
  if (toolId === 'scoresheet-tool') initScoreSheet();
  if (toolId === 'farkle-tool') initFarkleTool();
  if (toolId === 'spinner-tool') initSpinnerTool();
}

function closeToolModal() {
  const overlay = document.getElementById('tool-modal');
  if (overlay) overlay.classList.remove('open');
}

const _diagPatientIds = {};
let _diagNextId = 1;

function initSicknessTool() {
  if (initSicknessTool._done) return;
  initSicknessTool._done = true;
  fetch('https://raw.githubusercontent.com/EyosiyasBT/ShowCase/main/Tools/PatientDiagnosticSystem/illnesses.txt')
    .then(r => r.text())
    .then(text => {
      const illnesses = text.split('\n').map(l => l.trim()).filter(Boolean);

      const nameInput = document.getElementById('diag-name');
      const runBtn = document.getElementById('diag-run');
      const censorCheck = document.getElementById('diag-censor');
      const patientEl = document.getElementById('diag-patient');
      const illnessEl = document.getElementById('diag-illness');
      const severityEl = document.getElementById('diag-severity');
      const historyEl = document.getElementById('diag-history');

      function diagnose() {
        const name = nameInput.value.trim();
        if (!name) return;

        const raw = illnesses[Math.floor(Math.random() * illnesses.length)];
        const isPositive = raw.startsWith('x');
        let display = isPositive ? raw.slice(1) : raw;
        const severity = Math.floor(Math.random() * 5) + 1;

        if (censorCheck.checked && !isPositive) display = 'BAD CONSEQUENCE';

        const sevClass = isPositive ? 'sev-positive' : 'sev-' + severity;
        const stars = '★'.repeat(severity) + '☆'.repeat(5 - severity);

        const nameKey = name.toLowerCase();
        if (!_diagPatientIds[nameKey]) _diagPatientIds[nameKey] = _diagNextId++;
        const patientId = _diagPatientIds[nameKey];

        patientEl.textContent = name.toUpperCase();
        illnessEl.className = 'diag-illness ' + sevClass;
        illnessEl.textContent = display;
        severityEl.className = 'diag-severity ' + sevClass;
        severityEl.textContent = isPositive ? '' : 'SEVERITY: ' + stars;

        const entry = document.createElement('div');
        entry.className = 'diag-history-entry' + (isPositive ? ' positive' : '');
        entry.textContent = `${patientId} | ${name.toUpperCase()} | ${display}${isPositive ? '' : ' | LVL ' + severity}`;
        historyEl.prepend(entry);

        nameInput.value = '';
        nameInput.focus();
      }

      const clearBtn = document.getElementById('diag-clear');
      if (clearBtn) clearBtn.addEventListener('click', () => {
        historyEl.innerHTML = '';
        Object.keys(_diagPatientIds).forEach(k => delete _diagPatientIds[k]);
        _diagNextId = 1;
      });

      runBtn.addEventListener('click', diagnose);
      nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') diagnose(); });
    });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('fade-in')) {
        el.classList.add('visible');
      }

      el.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('bar-animate'), i * 60);
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.project-card, .stat-card, .skill-card, .tool-picker-card, .cert-item').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  document.querySelectorAll('.skills-grid, .section').forEach(el => {
    observer.observe(el);
  });

  // Sidebar bars are always in view — animate immediately with stagger
  document.querySelectorAll('.sidebar .skill-bar-fill').forEach((bar, i) => {
    setTimeout(() => bar.classList.add('bar-animate'), 300 + i * 80);
  });
}

// ── Score Sheet ──────────────────────────────────────────────────────────────

const _ss = {
  rows: 6,
  players: 2,
  gameName: '',
  rowLabels: Array(6).fill(''),
  multipliers: Array(6).fill(1),
  playerNames: Array(2).fill(''),
  scores: Array(6).fill(null).map(() => Array(2).fill('')),
  sumsRevealed: false,
  hideOthers: false,
  myPlayer: 0,
};

function initScoreSheet() {
  if (initScoreSheet._done) return;
  initScoreSheet._done = true;

  document.getElementById('ss-rows-minus').addEventListener('click', () => ssAdjRows(-1));
  document.getElementById('ss-rows-plus').addEventListener('click', () => ssAdjRows(1));
  document.getElementById('ss-players-minus').addEventListener('click', () => ssAdjPlayers(-1));
  document.getElementById('ss-players-plus').addEventListener('click', () => ssAdjPlayers(1));

  document.getElementById('ss-hide-others').addEventListener('change', function() {
    _ss.hideOthers = this.checked;
    document.getElementById('ss-my-player').classList.toggle('hidden', !this.checked);
    ssRender();
  });

  document.getElementById('ss-my-player').addEventListener('change', function() {
    _ss.myPlayer = parseInt(this.value);
    ssRender();
  });

  document.getElementById('ss-reveal-btn').addEventListener('click', function() {
    _ss.sumsRevealed = !_ss.sumsRevealed;
    this.textContent = _ss.sumsRevealed ? 'Hide Sums' : 'Reveal Sums';
    ssRender();
  });

  document.getElementById('scoresheet-close-btn').addEventListener('click', closeToolModal);

  ssRefreshMyPlayerSelect();
  ssRender();
}

function ssAdjRows(d) {
  const n = Math.max(1, Math.min(20, _ss.rows + d));
  if (n === _ss.rows) return;
  if (n > _ss.rows) {
    for (let r = _ss.rows; r < n; r++) {
      _ss.rowLabels.push('');
      _ss.multipliers.push(1);
      _ss.scores.push(Array(_ss.players).fill(''));
    }
  } else {
    _ss.rowLabels.length = n;
    _ss.multipliers.length = n;
    _ss.scores.length = n;
  }
  _ss.rows = n;
  document.getElementById('ss-rows-count').textContent = n;
  ssRender();
}

function ssAdjPlayers(d) {
  const n = Math.max(1, Math.min(8, _ss.players + d));
  if (n === _ss.players) return;
  if (n > _ss.players) {
    for (let p = _ss.players; p < n; p++) {
      _ss.playerNames.push('');
      _ss.scores.forEach(row => row.push(''));
    }
  } else {
    _ss.playerNames.length = n;
    _ss.scores.forEach(row => { row.length = n; });
    if (_ss.myPlayer >= n) _ss.myPlayer = n - 1;
  }
  _ss.players = n;
  document.getElementById('ss-players-count').textContent = n;
  ssRefreshMyPlayerSelect();
  ssRender();
}

function ssRefreshMyPlayerSelect() {
  const sel = document.getElementById('ss-my-player');
  if (!sel) return;
  sel.innerHTML = _ss.playerNames.map((nm, i) =>
    `<option value="${i}"${i === _ss.myPlayer ? ' selected' : ''}>${nm || 'Player ' + (i + 1)}</option>`
  ).join('');
}

function ssCalcSum(p) {
  let total = 0;
  for (let r = 0; r < _ss.rows; r++) {
    total += (parseFloat(_ss.scores[r][p]) || 0) * (parseFloat(_ss.multipliers[r]) || 1);
  }
  return total;
}

function ssEsc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ssRender() {
  const table = document.getElementById('ss-table');
  if (!table) return;

  let html = '<thead><tr>';
  html += `<th class="ss-th-game"><input class="ss-game-input" id="ss-game-inp" type="text" placeholder="Game name…" value="${ssEsc(_ss.gameName)}" /></th>`;
  for (let p = 0; p < _ss.players; p++) {
    const blur = _ss.hideOthers && p !== _ss.myPlayer;
    html += `<th class="ss-th-player${blur ? ' ss-blurred' : ''}"><input class="ss-name-input" data-p="${p}" type="text" placeholder="Player ${p + 1}" value="${ssEsc(_ss.playerNames[p])}"${blur ? ' tabindex="-1"' : ''} /></th>`;
  }
  html += '<th class="ss-th-mult">&#215;</th>';
  html += '</tr></thead><tbody>';

  for (let r = 0; r < _ss.rows; r++) {
    html += '<tr>';
    html += `<td class="ss-td-label"><input class="ss-label-input" data-r="${r}" type="text" placeholder="Row ${r + 1}" value="${ssEsc(_ss.rowLabels[r])}" /></td>`;
    for (let p = 0; p < _ss.players; p++) {
      const blur = _ss.hideOthers && p !== _ss.myPlayer;
      html += `<td class="${blur ? 'ss-blurred' : ''}"><input class="ss-score-input" data-r="${r}" data-p="${p}" type="number" placeholder="0" value="${ssEsc(_ss.scores[r][p])}"${blur ? ' tabindex="-1"' : ''} /></td>`;
    }
    html += `<td class="ss-td-mult"><input class="ss-mult-input" data-r="${r}" type="number" min="0" step="0.1" placeholder="1" value="${ssEsc(_ss.multipliers[r])}" /></td>`;
    html += '</tr>';
  }

  html += '<tr class="ss-sum-row"><td class="ss-sum-label">SUM</td>';
  for (let p = 0; p < _ss.players; p++) {
    const blur = _ss.hideOthers && p !== _ss.myPlayer;
    const val = _ss.sumsRevealed ? ssCalcSum(p) : '—';
    html += `<td class="ss-sum-cell${blur ? ' ss-blurred' : ''}" data-sum-p="${p}">${val}</td>`;
  }
  html += '<td class="ss-td-mult"></td></tr></tbody>';

  table.innerHTML = html;

  document.getElementById('ss-game-inp').addEventListener('input', function() { _ss.gameName = this.value; });

  table.querySelectorAll('.ss-name-input').forEach(el => {
    el.addEventListener('input', function() {
      _ss.playerNames[+this.dataset.p] = this.value;
      ssRefreshMyPlayerSelect();
    });
  });

  table.querySelectorAll('.ss-label-input').forEach(el => {
    el.addEventListener('input', function() { _ss.rowLabels[+this.dataset.r] = this.value; });
  });

  table.querySelectorAll('.ss-score-input').forEach(el => {
    el.addEventListener('input', function() {
      _ss.scores[+this.dataset.r][+this.dataset.p] = this.value;
      if (_ss.sumsRevealed) ssUpdateSumCells();
    });
  });

  table.querySelectorAll('.ss-mult-input').forEach(el => {
    el.addEventListener('input', function() {
      _ss.multipliers[+this.dataset.r] = this.value;
      if (_ss.sumsRevealed) ssUpdateSumCells();
    });
  });
}

function ssUpdateSumCells() {
  for (let p = 0; p < _ss.players; p++) {
    const cell = document.querySelector(`[data-sum-p="${p}"]`);
    if (cell) cell.textContent = ssCalcSum(p);
  }
}

// ── Farkle ───────────────────────────────────────────────────────────────────

const FARKLE_PIPS = {
  1: [0,0,0, 0,1,0, 0,0,0],
  2: [0,0,1, 0,0,0, 1,0,0],
  3: [0,0,1, 0,1,0, 1,0,0],
  4: [1,0,1, 0,0,0, 1,0,1],
  5: [1,0,1, 0,1,0, 1,0,1],
  6: [1,0,1, 1,0,1, 1,0,1],
};

let _farkle = null;

function initFarkleTool() {
  if (initFarkleTool._done) return;
  initFarkleTool._done = true;
  document.getElementById('farkle-close-btn').addEventListener('click', closeToolModal);
  farkleShowSetup();
}

function farkleShowSetup() {
  _farkle = null;
  const root = document.getElementById('farkle-root');
  if (!root) return;
  root.innerHTML = `
    <div class="fk-setup">
      <div class="fk-setup-row">
        <span class="fk-setup-lbl">Players</span>
        <div class="fk-toggle-grp">
          <button class="fk-tog fk-tog--on" data-pc="1">1 Player</button>
          <button class="fk-tog" data-pc="2">2 Players</button>
        </div>
      </div>
      <div class="fk-setup-row">
        <span class="fk-setup-lbl">Player 1</span>
        <input class="fk-inp" id="fkn1" type="text" placeholder="Player 1" maxlength="20" />
      </div>
      <div class="fk-setup-row hidden" id="fkn2-row">
        <span class="fk-setup-lbl">Player 2</span>
        <input class="fk-inp" id="fkn2" type="text" placeholder="Player 2" maxlength="20" />
      </div>
      <div class="fk-setup-row">
        <span class="fk-setup-lbl">Target</span>
        <input class="fk-inp fk-inp--num" id="fk-target" type="number" value="4000" min="500" step="500" />
      </div>
      <button class="fk-start-btn" id="fk-start">Start Game</button>
    </div>
  `;

  let playerCount = 1;
  root.querySelectorAll('[data-pc]').forEach(btn => {
    btn.addEventListener('click', () => {
      playerCount = parseInt(btn.dataset.pc);
      root.querySelectorAll('[data-pc]').forEach(b => b.classList.toggle('fk-tog--on', b === btn));
      document.getElementById('fkn2-row').classList.toggle('hidden', playerCount === 1);
    });
  });

  document.getElementById('fk-start').addEventListener('click', () => {
    const n1 = document.getElementById('fkn1').value.trim() || 'Player 1';
    const n2 = playerCount === 2 ? (document.getElementById('fkn2').value.trim() || 'Player 2') : null;
    const target = Math.max(500, parseInt(document.getElementById('fk-target').value) || 4000);
    farkleStartGame(playerCount === 2 ? '2p' : '1p', playerCount === 2 ? [n1, n2] : [n1], target);
  });
}

function farkleStartGame(mode, names, target) {
  _farkle = {
    mode,
    players: names.map(n => ({ name: n, score: 0 })),
    currentPlayer: 0,
    targetScore: target,
    turnScore: 0,
    dice: Array(6).fill(null).map(() => ({ value: 1, state: 'idle' })),
    rolling: false,
    hotDice: false,
    rounds: 0,
    won: false,
  };
  farkleRender();
}

function farkleScoreValues(vals) {
  if (!vals.length) return 0;
  const n = vals.length;
  const sorted = [...vals].sort((a, b) => a - b);

  if (n === 6 && sorted.join('') === '123456') return 1500;

  if (n === 5) {
    const s = sorted.join('');
    if (s === '12345') return 500;
    if (s === '23456') return 750;
  }

  if (n === 6) {
    for (let si = 0; si < 6; si++) {
      const sub = sorted.filter((_, i) => i !== si);
      const ss = sub.join('');
      if (ss === '12345' || ss === '23456') {
        const base = ss === '12345' ? 500 : 750;
        const extra = sorted[si] === 1 ? 100 : sorted[si] === 5 ? 50 : 0;
        return base + extra;
      }
    }
  }

  const cnt = new Array(7).fill(0);
  vals.forEach(v => cnt[v]++);
  let score = 0;
  for (let v = 1; v <= 6; v++) {
    const c = cnt[v];
    if (c >= 3) {
      score += (v === 1 ? 1000 : v * 100) * Math.pow(2, c - 3);
    } else if (v === 1) {
      score += c * 100;
    } else if (v === 5) {
      score += c * 50;
    }
  }
  return score;
}

function farkleSelectableDice(rolledWithIdx) {
  const n = rolledWithIdx.length;
  const vals = rolledWithIdx.map(d => d.value);
  const sorted = [...vals].sort((a, b) => a - b);
  const sel = new Set();

  if (n === 6 && sorted.join('') === '123456') {
    rolledWithIdx.forEach(d => sel.add(d.idx));
    return sel;
  }
  if (n === 5 && (sorted.join('') === '12345' || sorted.join('') === '23456')) {
    rolledWithIdx.forEach(d => sel.add(d.idx));
    return sel;
  }
  if (n === 6) {
    for (let si = 0; si < n; si++) {
      const sub = rolledWithIdx.filter((_, i) => i !== si);
      const ss = sub.map(d => d.value).sort((a, b) => a - b).join('');
      if (ss === '12345' || ss === '23456') {
        sub.forEach(d => sel.add(d.idx));
        if (rolledWithIdx[si].value === 1 || rolledWithIdx[si].value === 5) sel.add(rolledWithIdx[si].idx);
      }
    }
    if (sel.size > 0) return sel;
  }

  const cnt = new Array(7).fill(0);
  const byVal = {};
  rolledWithIdx.forEach(d => {
    cnt[d.value]++;
    if (!byVal[d.value]) byVal[d.value] = [];
    byVal[d.value].push(d.idx);
  });
  for (let v = 1; v <= 6; v++) {
    if (cnt[v] >= 3) byVal[v].forEach(i => sel.add(i));
  }
  if (cnt[1] > 0 && cnt[1] < 3) byVal[1].forEach(i => sel.add(i));
  if (cnt[5] > 0 && cnt[5] < 3) byVal[5].forEach(i => sel.add(i));

  return sel;
}

function farkleSelectedScore() {
  return farkleScoreValues(_farkle.dice.filter(d => d.state === 'selected').map(d => d.value));
}

function farkleCanRoll() {
  const f = _farkle;
  if (!f || f.rolling || f.won) return false;
  if (f.dice.some(d => d.state === 'idle')) return true;
  const sel = f.dice.filter(d => d.state === 'selected');
  return sel.length > 0 && farkleSelectedScore() > 0;
}

function farkleCanBank() {
  const f = _farkle;
  if (!f || f.rolling || f.won) return false;
  const sel = f.dice.filter(d => d.state === 'selected');
  return sel.length > 0 && farkleSelectedScore() > 0;
}

function farklePips(v) {
  return FARKLE_PIPS[v || 1].map(on =>
    '<span class="fkp' + (on ? ' fkp--on' : '') + '"></span>'
  ).join('');
}

function farkleRender(msg) {
  const root = document.getElementById('farkle-root');
  if (!root || !_farkle) return;
  const f = _farkle;
  const cp = f.players[f.currentPlayer];
  const pending = farkleSelectedScore();
  const canRoll = farkleCanRoll();
  const canBank = farkleCanBank();
  const bankTotal = f.turnScore + pending;

  const chips = f.players.map((p, i) =>
    '<div class="fk-chip' + (i === f.currentPlayer ? ' fk-chip--on' : '') + '">' +
    p.name + '<span>' + p.score + '</span></div>'
  ).join('');

  const dice = f.dice.map((d, i) => {
    const cl = 'fk-die die--' + d.state;
    const attr = (d.state === 'selectable' || d.state === 'selected') ? ' data-die="' + i + '"' : '';
    return '<div class="' + cl + '"' + attr + '><div class="fk-pips">' + farklePips(d.value) + '</div></div>';
  }).join('');

  const displayMsg = msg || (f.hotDice ? '🔥 Hot Dice! Roll again!' : '');
  const rollLabel = f.hotDice ? '🔥 Roll All' : 'Roll';
  const soloRounds = f.mode === '1p' ? '<div class="fk-rounds">Round ' + (f.rounds + 1) + '</div>' : '';
  const winBanner = f.won ? '<div class="fk-win-banner">🏆 ' + cp.name + ' wins!</div>' : '';

  root.innerHTML =
    '<div class="fk-header">' +
      '<div class="fk-turn">' + (f.won ? '🏆 ' + cp.name + ' wins!' : cp.name + '\'s Turn') + '</div>' +
      '<div class="fk-chips">' + chips + '</div>' +
      soloRounds +
    '</div>' +
    '<div class="fk-info">' +
      'Turn: <strong>' + f.turnScore + '</strong>' +
      (pending > 0 ? '<span class="fk-pending"> +' + pending + '</span>' : '') +
      '<span class="fk-target"> / ' + f.targetScore + '</span>' +
    '</div>' +
    '<div class="fk-dice-row">' + dice + '</div>' +
    '<div class="fk-msg">' + (displayMsg || '&nbsp;') + '</div>' +
    '<div class="fk-btns">' +
      '<button class="fk-btn fk-btn--roll" id="fk-roll"' + (canRoll ? '' : ' disabled') + '>' + rollLabel + '</button>' +
      '<button class="fk-btn fk-btn--bank" id="fk-bank"' + (canBank ? '' : ' disabled') + '>' +
        'Bank' + (bankTotal > 0 && canBank ? ' · ' + bankTotal : '') +
      '</button>' +
    '</div>' +
    '<button class="fk-restart" id="fk-restart">↺ New Game</button>';

  if (!f.won) {
    var rollBtn = document.getElementById('fk-roll');
    var bankBtn = document.getElementById('fk-bank');
    if (rollBtn) rollBtn.addEventListener('click', farkleRoll);
    if (bankBtn) bankBtn.addEventListener('click', farkleBank);
    root.querySelectorAll('.fk-die[data-die]').forEach(function(el) {
      el.addEventListener('click', function() { farkleToggleDie(parseInt(el.dataset.die)); });
    });
  }
  document.getElementById('fk-restart').addEventListener('click', function() {
    farkleShowSetup();
  });
}

function farkleToggleDie(idx) {
  const f = _farkle;
  if (!f || f.rolling) return;
  const d = f.dice[idx];
  if (d.state === 'selectable') d.state = 'selected';
  else if (d.state === 'selected') d.state = 'selectable';
  farkleRender();
}

function farkleRoll() {
  const f = _farkle;
  if (!f || f.rolling || f.won) return;

  const hasIdle = f.dice.some(d => d.state === 'idle');

  if (!hasIdle) {
    const sel = f.dice.filter(d => d.state === 'selected');
    if (!sel.length || farkleSelectedScore() === 0) return;
    const score = farkleScoreValues(sel.map(d => d.value));
    sel.forEach(d => { d.state = 'locked'; });
    f.turnScore += score;

    if (f.dice.every(d => d.state === 'locked')) {
      f.hotDice = true;
      f.dice.forEach(d => { d.state = 'idle'; });
      farkleRender();
      return;
    }
  }

  farkleDoRoll();
}

function farkleDoRoll() {
  const f = _farkle;
  f.rolling = true;
  f.hotDice = false;

  const toRollIdxs = [];
  f.dice.forEach(function(d, i) { if (d.state !== 'locked') toRollIdxs.push(i); });
  const finalVals = toRollIdxs.map(function() { return Math.floor(Math.random() * 6) + 1; });

  toRollIdxs.forEach(function(i) { f.dice[i].state = 'rolling'; });
  farkleRender();

  var interval = setInterval(function() {
    toRollIdxs.forEach(function(i) { f.dice[i].value = Math.floor(Math.random() * 6) + 1; });
    var rolling = document.querySelectorAll('.fk-die.die--rolling');
    rolling.forEach(function(el, j) {
      var pips = el.querySelector('.fk-pips');
      if (pips) pips.innerHTML = farklePips(f.dice[toRollIdxs[j]].value);
    });
  }, 80);

  setTimeout(function() {
    clearInterval(interval);
    toRollIdxs.forEach(function(i, j) { f.dice[i].value = finalVals[j]; });

    var rolledWithIdx = toRollIdxs.map(function(i) { return { value: f.dice[i].value, idx: i }; });
    var selSet = farkleSelectableDice(rolledWithIdx);

    toRollIdxs.forEach(function(i) {
      f.dice[i].state = selSet.has(i) ? 'selectable' : 'dead';
    });

    f.rolling = false;

    if (!f.dice.some(function(d) { return d.state === 'selectable'; })) {
      farkleDoFarkle();
      return;
    }
    farkleRender();
  }, 850);
}

function farkleBank() {
  const f = _farkle;
  if (!f || f.rolling || f.won) return;
  const sel = f.dice.filter(d => d.state === 'selected');
  if (!sel.length || farkleSelectedScore() === 0) return;

  f.turnScore += farkleScoreValues(sel.map(d => d.value));
  f.players[f.currentPlayer].score += f.turnScore;

  if (f.players[f.currentPlayer].score >= f.targetScore) {
    f.won = true;
    farkleRender();
    return;
  }
  farkleNextTurn();
}

function farkleDoFarkle() {
  const f = _farkle;
  f.turnScore = 0;
  farkleRender('💀 Farkle! Turn lost.');
  setTimeout(function() { farkleNextTurn(); }, 1800);
}

function farkleNextTurn() {
  const f = _farkle;
  if (f.mode === '2p') {
    f.currentPlayer = 1 - f.currentPlayer;
  } else {
    f.rounds++;
  }
  f.turnScore = 0;
  f.hotDice = false;
  f.dice.forEach(d => { d.state = 'idle'; d.value = 1; });
  farkleRender();
}

// ── Spinner Tool ──────────────────────────────────────────────────────────────

var _spinner = null;

var SP_COLORS = [
  '#f0c040','#e05c5c','#5ca0e0','#5ce09f',
  '#e05ce0','#e09a5c','#5ce0d8','#a05ce0',
  '#c0e05c','#e0c05c','#5c7ae0','#e0765c'
];

function initSpinnerTool() {
  if (!initSpinnerTool._done) {
    initSpinnerTool._done = true;
    document.getElementById('spinner-close-btn').addEventListener('click', closeToolModal);
    _spinner = { phase: 'setup', countMode: '2', customVal: '3', spinners: [] };
  }
  spinnerRender();
}

function spNewSpinner() {
  return {
    title: '', mode: 'fair',
    items: [{ label: '', weight: 50 }, { label: '', weight: 50 }],
    result: null, spinning: false, totalRotation: 0, editOpen: true
  };
}

function spWeightedPick(s) {
  var active = s.items.filter(function(it) {
    return it.label.trim() && (s.mode === 'fair' || it.weight > 0);
  });
  if (!active.length) return null;
  if (s.mode === 'fair') return active[Math.floor(Math.random() * active.length)];
  var total = active.reduce(function(acc, it) { return acc + it.weight; }, 0);
  if (!total) return null;
  var r = Math.random() * total;
  for (var i = 0; i < active.length; i++) {
    r -= active[i].weight;
    if (r <= 0) return active[i];
  }
  return active[active.length - 1];
}

function spSegments(s) {
  var active = s.items.filter(function(it) {
    return it.label.trim() && (s.mode === 'fair' || it.weight > 0);
  });
  if (!active.length) return [];
  var total = s.mode === 'weighted'
    ? active.reduce(function(acc, it) { return acc + it.weight; }, 0)
    : active.length;
  var segs = [], start = 0;
  active.forEach(function(it, i) {
    var w = s.mode === 'weighted' ? it.weight : 1;
    var angle = (w / total) * 360;
    segs.push({ item: it, start: start, angle: angle, color: SP_COLORS[i % SP_COLORS.length] });
    start += angle;
  });
  return segs;
}

function spWheelSVG(s, id) {
  var segs = spSegments(s);
  var cx = 120, cy = 120, r = 108;
  if (!segs.length) {
    return '<svg viewBox="0 0 240 240" class="sp-wheel"><circle cx="120" cy="120" r="108" fill="#2a2a2a" stroke="#3a3a3a" stroke-width="2"/><text x="120" y="116" text-anchor="middle" fill="#555" font-size="12" font-family="inherit">Add items</text><text x="120" y="134" text-anchor="middle" fill="#555" font-size="12" font-family="inherit">to spin</text></svg>';
  }
  var body = '';
  if (segs.length === 1) {
    body += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + segs[0].color + '"/>';
    var sl = segs[0].item.label;
    var lbl = sl.length > 12 ? sl.substring(0, 11) + '…' : sl;
    body += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="#111" font-weight="600" font-family="inherit">' + lbl + '</text>';
  } else {
    segs.forEach(function(seg) {
      var a1 = (seg.start - 90) * Math.PI / 180;
      var a2 = (seg.start + seg.angle - 90) * Math.PI / 180;
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var large = seg.angle > 180 ? 1 : 0;
      body += '<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(2) + ',' + y1.toFixed(2) +
        ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) + ' Z" fill="' + seg.color + '"/>';
      if (seg.angle >= 20) {
        var ma = (seg.start + seg.angle / 2 - 90) * Math.PI / 180;
        var lx = cx + r * 0.62 * Math.cos(ma);
        var ly = cy + r * 0.62 * Math.sin(ma);
        var raw = seg.item.label;
        var lbl2 = raw.length > 9 ? raw.substring(0, 8) + '…' : raw;
        body += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#111" font-weight="600" font-family="inherit">' + lbl2 + '</text>';
      }
    });
    segs.forEach(function(seg) {
      var a = (seg.start - 90) * Math.PI / 180;
      body += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(a)).toFixed(2) + '" y2="' + (cy + r * Math.sin(a)).toFixed(2) + '" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>';
    });
  }
  body += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="2"/>';
  body += '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="#1a1a1a"/><circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#888"/>';
  return '<svg viewBox="0 0 240 240" class="sp-wheel" id="sp-wheel-' + id + '">' + body + '</svg>';
}

function spinnerRender() {
  var root = document.getElementById('spinner-root');
  if (!root) return;
  root.innerHTML = _spinner.phase === 'setup' ? spSetupHTML() : spGameHTML();
  _spinner.phase === 'setup' ? spBindSetup() : spBindGame();
}

function spSetupHTML() {
  var opts = ['1', '2', '3', 'custom'];
  var btns = opts.map(function(m) {
    var lbl = m === 'custom' ? 'Custom' : m;
    var cls = 'sp-count-btn' + (_spinner.countMode === m ? ' sp-count-btn--active' : '');
    return '<button class="' + cls + '" data-mode="' + m + '">' + lbl + '</button>';
  }).join('');
  var ci = _spinner.countMode === 'custom'
    ? '<input id="sp-custom-val" class="sp-custom-inp" type="number" min="1" max="8" value="' + (_spinner.customVal || '3') + '">'
    : '';
  return '<div class="sp-setup"><div class="sp-setup-label">How many spinners?</div>' +
    '<div class="sp-count-row">' + btns + ci + '</div>' +
    '<button class="diag-btn sp-start-btn" id="sp-start">START</button></div>';
}

function spBindSetup() {
  document.querySelectorAll('.sp-count-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { _spinner.countMode = this.dataset.mode; spinnerRender(); });
  });
  var ci = document.getElementById('sp-custom-val');
  if (ci) ci.addEventListener('input', function() { _spinner.customVal = this.value; });
  document.getElementById('sp-start').addEventListener('click', function() {
    var n = _spinner.countMode === 'custom'
      ? Math.min(8, Math.max(1, parseInt(_spinner.customVal) || 2))
      : parseInt(_spinner.countMode);
    _spinner.spinners = [];
    for (var i = 0; i < n; i++) _spinner.spinners.push(spNewSpinner());
    _spinner.phase = 'game';
    spinnerRender();
  });
}

function spGameHTML() {
  var n = _spinner.spinners.length;
  var gc = n === 1 ? 'sp-grid--1' : n === 2 ? 'sp-grid--2' : n === 3 ? 'sp-grid--3' : 'sp-grid--multi';
  var cards = _spinner.spinners.map(function(s, i) { return spCardHTML(s, i); }).join('');
  return '<div class="sp-grid ' + gc + '">' + cards + '</div>' +
    '<button class="sp-reset-btn" id="sp-reset">↩ New Setup</button>';
}

function spCardHTML(s, i) {
  if (s.editOpen) return spEditHTML(s, i);
  var active = s.items.filter(function(it) { return it.label.trim(); });
  var resCls = 'sp-result' + (s.result ? '' : ' sp-result--empty');
  var resTxt = s.result || '—';
  var dis = (s.spinning || !active.length) ? ' disabled' : '';
  var btnCls = 'sp-spin-btn' + (s.spinning ? ' sp-spin-btn--busy' : '');
  var titleHtml = s.title ? '<div class="sp-card-title">' + s.title + '</div>' : '<div></div>';
  return '<div class="sp-card" id="sp-card-' + i + '">' +
    '<div class="sp-card-top">' + titleHtml +
    '<button class="sp-cog" data-idx="' + i + '" title="Edit">⚙</button></div>' +
    '<div class="sp-wheel-wrap" id="sp-wrap-' + i + '">' +
    '<div class="sp-ptr">▼</div>' + spWheelSVG(s, i) + '</div>' +
    '<div class="' + resCls + '">' + resTxt + '</div>' +
    '<button class="' + btnCls + '" data-idx="' + i + '"' + dis + '>' +
    (s.spinning ? 'Spinning…' : 'SPIN') + '</button></div>';
}

function spEditHTML(s, i) {
  var fCls = 'sp-mode-btn' + (s.mode === 'fair' ? ' sp-mode-btn--active' : '');
  var wCls = 'sp-mode-btn' + (s.mode === 'weighted' ? ' sp-mode-btn--active' : '');
  var rows = s.items.map(function(it, j) {
    var wt = s.mode === 'weighted'
      ? '<input class="sp-wt-inp" type="number" min="0" max="100" value="' + it.weight + '" data-idx="' + i + '" data-item="' + j + '">'
      : '';
    return '<div class="sp-item-row">' +
      '<input class="sp-lbl-inp" type="text" placeholder="Item name…" value="' + it.label + '" data-idx="' + i + '" data-item="' + j + '">' +
      wt + '<button class="sp-rm-btn" data-idx="' + i + '" data-item="' + j + '">\xd7</button></div>';
  }).join('');
  return '<div class="sp-card sp-card--edit" id="sp-card-' + i + '">' +
    '<div class="sp-edit-hd"><button class="sp-done-btn" data-idx="' + i + '">✓ Done</button></div>' +
    '<input class="sp-title-inp" type="text" placeholder="Spinner title (optional)" value="' + s.title + '" data-idx="' + i + '">' +
    '<div class="sp-mode-row"><button class="' + fCls + '" data-idx="' + i + '" data-mode="fair">Fair</button>' +
    '<button class="' + wCls + '" data-idx="' + i + '" data-mode="weighted">Weighted</button></div>' +
    '<div class="sp-items-list">' + rows + '</div>' +
    '<button class="sp-add-btn" data-idx="' + i + '">+ Add item</button></div>';
}

function spBindGame() {
  document.querySelectorAll('.sp-cog').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _spinner.spinners[+this.dataset.idx].editOpen = true; spinnerRender();
    });
  });
  document.querySelectorAll('.sp-spin-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { spDoSpin(+this.dataset.idx); });
  });
  document.querySelectorAll('.sp-done-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _spinner.spinners[+this.dataset.idx].editOpen = false; spinnerRender();
    });
  });
  document.querySelectorAll('.sp-mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _spinner.spinners[+this.dataset.idx].mode = this.dataset.mode; spinnerRender();
    });
  });
  document.querySelectorAll('.sp-title-inp').forEach(function(inp) {
    inp.addEventListener('input', function() { _spinner.spinners[+this.dataset.idx].title = this.value; });
  });
  document.querySelectorAll('.sp-lbl-inp').forEach(function(inp) {
    inp.addEventListener('input', function() {
      _spinner.spinners[+this.dataset.idx].items[+this.dataset.item].label = this.value;
    });
  });
  document.querySelectorAll('.sp-wt-inp').forEach(function(inp) {
    inp.addEventListener('input', function() {
      _spinner.spinners[+this.dataset.idx].items[+this.dataset.item].weight =
        Math.min(100, Math.max(0, parseInt(this.value) || 0));
    });
  });
  document.querySelectorAll('.sp-rm-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var s = _spinner.spinners[+this.dataset.idx];
      s.items.splice(+this.dataset.item, 1);
      if (!s.items.length) s.items.push({ label: '', weight: 50 });
      spinnerRender();
    });
  });
  document.querySelectorAll('.sp-add-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _spinner.spinners[+this.dataset.idx].items.push({ label: '', weight: 50 }); spinnerRender();
    });
  });
  var rb = document.getElementById('sp-reset');
  if (rb) rb.addEventListener('click', function() {
    _spinner.phase = 'setup'; _spinner.spinners = []; spinnerRender();
  });
  // Restore wheel rotation after re-render (no transition)
  _spinner.spinners.forEach(function(s, i) {
    if (s.editOpen || !s.totalRotation) return;
    var svg = document.getElementById('sp-wheel-' + i);
    if (svg) { svg.style.transition = 'none'; svg.style.transform = 'rotate(' + s.totalRotation + 'deg)'; }
  });
}

function spDoSpin(i) {
  var s = _spinner.spinners[i];
  if (s.spinning) return;
  var winner = spWeightedPick(s);
  if (!winner) return;
  var segs = spSegments(s);
  var winSeg = null;
  for (var k = 0; k < segs.length; k++) {
    if (segs[k].item === winner) { winSeg = segs[k]; break; }
  }
  if (!winSeg) return;

  // midpoint of winner segment, clockwise degrees from top
  var mid = winSeg.start + winSeg.angle / 2;
  // rotate wheel clockwise by R: pointer (at 0°) then points to (360-R)%360 from original top
  // need (360-R)%360 = mid  →  R%360 = (360-mid)%360
  var targetMod = (360 - mid + 360) % 360;
  var currentMod = s.totalRotation % 360;
  var delta = (targetMod - currentMod + 360) % 360;
  if (delta < 60) delta += 360;
  delta += 360 * (3 + Math.floor(Math.random() * 3));

  s.spinning = true;
  s.result = null;
  s.totalRotation += delta;

  // Update button directly (avoid full re-render which would lose transition origin)
  var btn = document.querySelector('.sp-spin-btn[data-idx="' + i + '"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Spinning…'; btn.classList.add('sp-spin-btn--busy'); }
  var res = document.querySelector('#sp-card-' + i + ' .sp-result');
  if (res) { res.textContent = '—'; res.className = 'sp-result sp-result--empty'; }

  var svg = document.getElementById('sp-wheel-' + i);
  if (svg) {
    svg.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    svg.style.transform = 'rotate(' + s.totalRotation + 'deg)';
  }

  setTimeout(function() {
    s.spinning = false;
    s.result = winner.label;
    spinnerRender();
  }, 4200);
}
