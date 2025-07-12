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

function copy(txt) {
  navigator.clipboard.writeText(txt);
}

// 1. Suggest topics
async function suggest() {
  const niche = qs('#niche').value;
  if (!niche) return alert('Enter niche');
  const { topics } = await post('suggest-topics', { niche });
  qs('#topicList').innerHTML = topics.map(t =>
    `<div>${t} <button onclick="copy('${t.replace(/'/g,'\\')}')">copy</button></div>`).join('');
}

// 2. Generate blog
async function genBlog() {
  const topic = qs('#blogTopic').value;
  if (!topic) return alert('Enter topic');
  const { markdown } = await post('generate-blog', { topic });
  qs('#blogOut').textContent = markdown;
}

// 3. Meta tags
async function metaTags() {
  const title = qs('#metaTitle').value;
  if (!title) return alert('Enter title');
  const data = await post('meta-tags', { title });
  qs('#metaOut').textContent = JSON.stringify(data, null, 2);
}

// 4. LinkedIn post
async function genLinkedIn() {
  const blogMd = qs('#liText').value;
  if (!blogMd) return alert('Paste blog markdown');
  const { post } = await post('linkedin-post', { blogMd });
  qs('#liOut').textContent = post;
}

// 5. Planner & 6. Tracker (localStorage)
const plans = JSON.parse(localStorage.plans||'[]');
const tracks = JSON.parse(localStorage.tracks||'[]');
function addPlan() {
  const date = qs('#planDate').value;
  const text = qs('#planText').value;
  if (!date || !text) return alert('Fill both fields');
  plans.push({date,text});
  localStorage.plans = JSON.stringify(plans);
  renderPlans();
}
function addTrack() {
  const url = qs('#trackUrl').value;
  const kw = qs('#trackKw').value;
  if (!url || !kw) return alert('Fill both fields');
  tracks.push({url,kw});
  localStorage.tracks = JSON.stringify(tracks);
  renderTracks();
}
function renderPlans() {
  qs('#planTable').innerHTML = plans.map(p=>`<tr><td>${p.date}</td><td>${p.text}</td></tr>`).join('');
}
function renderTracks() {
  qs('#trackTable').innerHTML = tracks.map(t=>`<tr><td><a href="${t.url}" target="_blank">${t.kw}</a></td></tr>`).join('');
}
renderPlans(); renderTracks();

// Dark mode
qs('#themeToggle').onclick = () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
};
