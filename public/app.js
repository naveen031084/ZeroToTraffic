const API = path => `/api/${path}`;
const qs = sel => document.querySelector(sel);

async function post(url, body) {
  const r = await fetch(API(url), {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  return r.json();
}

function copy(text) {
  navigator.clipboard.writeText(text);
}

// 1. Suggest Topics
async function suggest() {
  const niche = qs('#niche').value.trim();
  if (!niche) return alert('Enter a niche!');
  qs('#topicList').innerHTML = '<div class="card">Loading...</div>';
  const { topics } = await post('suggest-topics', { niche });
  qs('#topicList').innerHTML = topics
    .map(t => `
      <div class="card">
        <p>${t}</p>
        <button class="copy-btn" onclick="copy('${t.replace(/'/g,"\\'")}')" title="Copy">📋</button>
      </div>`)
    .join('');
}

// 2. Blog Generator
async function genBlog() {
  const topic = qs('#blogTopic').value.trim();
  if (!topic) return alert('Enter a topic!');
  qs('#blogOut').innerHTML = '<div class="card">Writing...</div>';
  const { markdown } = await post('generate-blog', { topic });
  qs('#blogOut').innerHTML = `
    <pre style="white-space: pre-wrap; margin:0;">${markdown}</pre>
    <button class="copy-btn" onclick="copy(\`${markdown.replace(/`/g,'\\`')}\`)" title="Copy">📋</button>`;
}

// 3. Meta Tags
async function metaTags() {
  const title = qs('#metaTitle').value.trim();
  if (!title) return alert('Enter a title!');
  qs('#metaOut').innerHTML = '<div class="card">Crafting...</div>';
  const data = await post('meta-tags', { title });
  qs('#metaOut').innerHTML = `
    <p><strong>Title:</strong> ${data.title}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <button class="copy-btn" onclick="copy(\`${JSON.stringify(data).replace(/`/g,'\\`')}\`)" title="Copy">📋</button>`;
}

// 4. LinkedIn Post
async function genLinkedIn() {
  const blogMd = qs('#liText').value.trim();
  if (!blogMd) return alert('Paste blog content!');
  qs('#liOut').innerHTML = '<div class="card">Creating...</div>';
  const { post } = await post('linkedin-post', { blogMd });
  qs('#liOut').innerHTML = `
    <p>${post}</p>
    <button class="copy-btn" onclick="copy(\`${post.replace(/`/g,'\\`')}\`)" title="Copy">📋</button>`;
}

// 5. Content Planner
const plans = JSON.parse(localStorage.plans || '[]');
function addPlan() {
  const date = qs('#planDate').value;
  const text = qs('#planText').value.trim();
  if (!date || !text) return alert('Fill both fields!');
  plans.push({ date, text });
  localStorage.plans = JSON.stringify(plans);
  renderPlans();
}
function renderPlans() {
  qs('#planTable').innerHTML = plans
    .map(p => `<tr><td>${p.date}</td><td>${p.text}</td></tr>`)
    .join('');
}

// 6. Performance Tracker
const tracks = JSON.parse(localStorage.tracks || '[]');
function addTrack() {
  const url = qs('#trackUrl').value.trim();
  const kw = qs('#trackKw').value.trim();
  if (!url || !kw) return alert('Fill both fields!');
  tracks.push({ url, kw });
  localStorage.tracks = JSON.stringify(tracks);
  renderTracks();
}
function renderTracks() {
  qs('#trackTable').innerHTML = tracks
    .map(t => `<tr><td><a href="${t.url}" target="_blank">${t.kw}</a></td></tr>`)
    .join('');
}
renderPlans();
renderTracks();

// Dark mode toggle
qs('#themeToggle').onclick = () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
};
