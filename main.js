fetch('/data.json')
  .then(r => r.json())
  .then(d => {
    renderSidebar(d);
    if (document.getElementById('hero')) renderHome(d);
    if (document.getElementById('projects-grid')) renderProjects(d);
    if (document.getElementById('experience-list')) renderExperience(d);
    if (document.getElementById('skills-page')) renderSkillsPage(d);
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

  renderProjectCards(d.projects, document.getElementById('projects-preview'), 3);
}

function renderProjects(d) {
  renderProjectCards(d.projects, document.getElementById('projects-grid'), d.projects.length);
}

function renderProjectCards(projects, container, limit) {
  if (!container) return;
  container.innerHTML = projects.slice(0, limit).map(p => {
    const tags = p.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
    const inner = `<h3>${p.name}</h3><p>${p.description}</p>${tags}`;
    return p.url
      ? `<a href="${p.url}" class="project-card">${inner}</a>`
      : `<div class="project-card">${inner}</div>`;
  }).join('');
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
