fetch('/data.json')
  .then(r => r.json())
  .then(d => {
    renderSidebar(d);
    if (document.getElementById('hero')) renderHome(d);
    if (document.getElementById('projects-grid')) renderProjects(d);
    if (document.getElementById('experience-list')) renderExperience(d);
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
  s.innerHTML = `
    <div class="avatar">${d.name[0]}</div>
    <div class="sidebar-name">${d.name}</div>
    <div class="sidebar-title">${d.title}</div>
    <hr class="sidebar-divider" />
    <table class="info-table">
      <tr><td>Location</td><td>${d.location}</td></tr>
      <tr><td>Status</td><td>${d.status}</td></tr>
      <tr><td>Email</td><td>${d.email}</td></tr>
    </table>
    <hr class="sidebar-divider" />
    ${d.skills.length ? `
      <div class="skills-label">Top Skills</div>
      ${d.skills.map(sk => `
        <div class="skill-bar">
          <div class="skill-bar-top"><span>${sk.name}</span><span>${sk.level}%</span></div>
          <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${sk.level}%"></div></div>
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

  document.getElementById('stats').innerHTML = d.stats.map(s => `
    <div class="stat-card">
      <div class="stat-number">${s.github ? `<span data-github>...</span>` : s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

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

function renderExperience(d) {
  const expEl = document.getElementById('experience-list');
  if (expEl) {
    expEl.innerHTML = d.experience.map(e => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>${e.role}</h3>
          <div class="timeline-meta">${e.company} · ${e.period}</div>
          <p>${e.description}</p>
        </div>
      </div>`).join('');
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
      <div class="cert-item">${c}</div>`).join('');
  }
}
