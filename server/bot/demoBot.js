
const BOT_TOKEN = process.env.BOT_TOKEN || 'demo-bot-token';
const SERVER = process.env.SERVER_URL || 'http://localhost:3000';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 5000;

async function poll() {
  try {
    const res = await fetch(`${SERVER}/tasks/semantic-tasks`, {
      headers: { 'x-bot-token': BOT_TOKEN }
    });
    if (!res.ok) {
      console.error('Failed to fetch tasks:', res.status, await res.text());
      return;
    }
    const tasks = await res.json();
    if (!Array.isArray(tasks) || tasks.length === 0) return;

    for (const t of tasks) {
      console.log('Processing task', t.id, t.token, t.main_keyword);
      const base = (t.main_keyword || '').trim();
      const words = base.split(/\s+/).filter(Boolean);
      const keywords = new Set();
      if (base) keywords.add(base);
      if (words.length > 1) {
        keywords.add(words.slice().reverse().join(' '));
      }
      words.forEach(w => keywords.add(w));
      keywords.add(base + ' цена');
      keywords.add(base + ' купить');

      // send token if present so server can identify task by token
      const body = { keywords: Array.from(keywords) };
      if (t.token) body.token = t.token;

      const url = t.id ? `${SERVER}/tasks/semantic-tasks/${t.id}/complete` : `${SERVER}/tasks/semantic-tasks/complete`;
      const completeRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-bot-token': BOT_TOKEN },
        body: JSON.stringify(body)
      });
      if (!completeRes.ok) {
        console.error('Failed to complete task', t.id, await completeRes.text());
      } else {
        console.log('Completed task', t.id);
      }
    }
  } catch (err) {
    console.error('Bot error', err && err.message ? err.message : err);
  }
}

async function loop() {
  while (true) {
    await poll();
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

if (process.argv[1] && process.argv[1].endsWith('demoBot.js')) {
  console.log('Starting demo bot. SERVER=', SERVER, 'BOT_TOKEN=', BOT_TOKEN);
  loop();
}

export { poll };
