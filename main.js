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
  if (content) content.classList.toggle('modal--wide', toolId === 'scoresheet-tool');

  overlay.classList.add('open');

  if (toolId === 'sickness-tool') initSicknessTool();
  if (toolId === 'scoresheet-tool') initScoreSheet();
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
