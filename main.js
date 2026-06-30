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
  });

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
    <h1>${d.name}<br /><span>${d.title}</span></h1>
    <p class="hero-sub">${d.bio}</p>
    <a href="${d.links.showcase}" class="hero-cta">View ShowCase</a>
  `;

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
      return `<div class="project-card${p.image ? ' project-card--image' : ''}" style="cursor:pointer" data-detail-index="${i}">${inner}</div>`;
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
    expEl.innerHTML = d.experience.map(e => {
      const tags = e.tags ? e.tags.map(t => `<span class="project-tag">${t}</span>`).join('') : '';
      return `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h3>${e.role}</h3>
            <div class="timeline-meta">${e.company} · ${e.period}</div>
            <p>${e.description}</p>
            ${tags ? `<div class="timeline-tags">${tags}</div>` : ''}
          </div>
        </div>`;
    }).join('');
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
    card.addEventListener('click', () => openTool(card.dataset.toolId, d));
  });

  document.getElementById('tool-back-btn').addEventListener('click', () => {
    document.getElementById('tools-picker').style.display = '';
    document.getElementById('tool-active').style.display = 'none';
    document.querySelectorAll('#tool-active .tool-card').forEach(el => el.style.display = 'none');
  });
}

function openTool(toolId, d) {
  document.getElementById('tools-picker').style.display = 'none';
  const activeSection = document.getElementById('tool-active');
  activeSection.style.display = '';

  const tool = (d.tools || []).find(t => t.id === toolId);
  document.getElementById('tool-active-title').textContent = tool ? tool.name : '';

  const toolEl = document.getElementById(toolId);
  if (toolEl) toolEl.style.display = '';

  if (toolId === 'sickness-tool') initSicknessTool();
}

function initSicknessTool() {
  if (initSicknessTool._done) return;
  initSicknessTool._done = true;
  fetch('/illnesses.json')
    .then(r => r.json())
    .then(illnesses => {
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

        patientEl.textContent = name.toUpperCase();
        illnessEl.className = 'diag-illness ' + sevClass;
        illnessEl.textContent = display;
        severityEl.className = 'diag-severity ' + sevClass;
        severityEl.textContent = isPositive ? '' : 'SEVERITY: ' + stars;

        const entry = document.createElement('div');
        entry.className = 'diag-history-entry' + (isPositive ? ' positive' : '');
        entry.textContent = `${name.toUpperCase()} | ${display}${isPositive ? '' : ' | LVL ' + severity}`;
        historyEl.prepend(entry);

        nameInput.value = '';
        nameInput.focus();
      }

      runBtn.addEventListener('click', diagnose);
      nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') diagnose(); });
    });
}
