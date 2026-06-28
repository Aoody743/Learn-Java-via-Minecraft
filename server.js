const http = require('node:http');
const { execFile } = require('node:child_process');
const { mkdtemp, writeFile, rm, stat, mkdir, readFile } = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const PORT = Number(process.env.PORT || 8000);
const ROOT = process.cwd();
const JAVA_IMAGE = process.env.JAVA_SANDBOX_IMAGE || 'eclipse-temurin:21-jdk';
const MAX_BODY_BYTES = 64_000;
const MAX_CODE_BYTES = 20_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 30);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon'
};
const rateBuckets = new Map();
const RUNTIME_DIR = path.join(ROOT, '.runtime');
const USERS_FILE = path.join(RUNTIME_DIR, 'users.json');
let activeSandboxRuns = 0;
const MAX_CONCURRENT_SANDBOXES = Number(process.env.MAX_CONCURRENT_SANDBOXES || 2);

const sandboxTasks = {
  health_check: {
    title: '生命值判定',
    tests: [
      { name: '包含死亡判断', pattern: /health\s*<=\s*0/ },
      { name: '输出玩家死亡', pattern: /玩家死亡/ }
    ]
  },
  welcome_message: {
    title: '欢迎命令',
    tests: [
      { name: '输出欢迎内容', pattern: /System\.out\.println\s*\(/ },
      { name: '包含欢迎内容', pattern: /欢迎/ }
    ]
  },
  money_map: {
    title: '金币 Map',
    tests: [
      { name: '保存余额 put', pattern: /\.put\s*\(/ },
      { name: '读取余额 get', pattern: /\.get\s*\(/ }
    ]
  }
};


async function readUsers() {
  try {
    return JSON.parse(await readFile(USERS_FILE, 'utf8'));
  } catch {
    return { users: {}, leaderboard: [] };
  }
}

async function writeUsers(data) {
  await mkdir(RUNTIME_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function publicUser(user) {
  return { id: user.id, name: user.name, token: user.token, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

async function handleUsers(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  const body = JSON.parse(await readBody(req));
  const name = String(body.name || 'Minecraft 学徒').slice(0, 32);
  const data = await readUsers();
  const id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const token = `tok_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  data.users[id] = { id, token, name, progress: {}, score: 0, createdAt: now, updatedAt: now };
  await writeUsers(data);
  return sendJson(res, 201, { user: publicUser(data.users[id]) });
}

function computeScore(progress = {}) {
  return (progress.completedPractices || []).length * 25 + (progress.completedLessons || []).length * 10 + (progress.completedPlugins || []).length * 15 + (progress.completedSandboxes || []).length * 50 + (progress.visitedMod ? 20 : 0);
}

async function handleProgress(req, res, requestUrl) {
  const userId = requestUrl.searchParams.get('userId');
  const data = await readUsers();
  if (!userId || !data.users[userId]) return sendJson(res, 404, { error: '用户不存在。' });
  if (req.method === 'GET') return sendJson(res, 200, { progress: data.users[userId].progress || {}, score: data.users[userId].score || 0 });
  if (req.method !== 'PUT') return sendJson(res, 405, { error: 'Method not allowed' });
  const body = JSON.parse(await readBody(req));
  if (body.token !== data.users[userId].token) return sendJson(res, 403, { error: '云端令牌无效。' });
  data.users[userId].progress = body.progress || {};
  data.users[userId].score = computeScore(data.users[userId].progress);
  data.users[userId].updatedAt = new Date().toISOString();
  data.leaderboard = Object.values(data.users).map(user => ({ userId: user.id, name: user.name, score: user.score || 0, updatedAt: user.updatedAt })).sort((a, b) => b.score - a.score).slice(0, 20);
  await writeUsers(data);
  return sendJson(res, 200, { ok: true, user: publicUser(data.users[userId]) });
}

async function handleLeaderboard(req, res) {
  const data = await readUsers();
  const leaderboard = data.leaderboard || Object.values(data.users).map(user => ({ userId: user.id, name: user.name, score: user.score || 0, updatedAt: user.updatedAt })).sort((a, b) => b.score - a.score).slice(0, 20);
  return sendJson(res, 200, { leaderboard });
}

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(JSON.stringify(payload));
}

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(req) {
  const now = Date.now();
  const key = clientIp(req);
  const bucket = rateBuckets.get(key) || { resetAt: now + RATE_WINDOW_MS, count: 0 };
  if (now > bucket.resetAt) {
    bucket.resetAt = now + RATE_WINDOW_MS;
    bucket.count = 0;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return { allowed: bucket.count <= RATE_LIMIT, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('请求体过大'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function createRequestId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function classifyDockerResult(result) {
  if (/timeout|SIGTERM|ETIMEDOUT/i.test(result.error + result.stderr)) return 'timeout';
  if (/javac|error:/i.test(result.stderr)) return 'compile_error';
  if (/OutOfMemory|memory/i.test(result.stderr + result.error)) return 'memory_limit';
  if (/spawn docker ENOENT/i.test(result.error)) return 'docker_unavailable';
  if (result.ok) return 'success';
  return 'system_error';
}

function statusToHttpStatus(status) {
  return {
    success: 200,
    tests_failed: 422,
    compile_error: 400,
    timeout: 408,
    memory_limit: 422,
    docker_unavailable: 503,
    system_error: 500
  }[status] || 500;
}

function runDocker(workdir) {
  return new Promise(resolve => {
    const args = [
      'run', '--rm', '--network', 'none', '--cpus', '0.5', '--memory', '128m', '--pids-limit', '64',
      '--read-only', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
      '-v', `${workdir}:/workspace:ro`, '-w', '/workspace', JAVA_IMAGE,
      'bash', '-lc', 'timeout 5s javac Main.java && timeout 3s java Main'
    ];
    execFile('docker', args, { timeout: 8000, maxBuffer: 256_000 }, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout, stderr, error: error ? error.message : '' });
    });
  });
}

function validateCode(code) {
  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) return '代码超过大小限制。';
  if (!/public\s+class\s+Main/.test(code)) return '代码必须包含 public class Main。';
  if (/\b(?:System\.exit|Runtime\.getRuntime|ProcessBuilder|java\.io\.File|Files\.|Socket)\b/.test(code)) return '代码包含沙箱练习不允许的 API。';
  return '';
}

async function handleJava(req, res) {
  const requestId = createRequestId();
  const startedAt = new Date().toISOString();
  const rate = checkRateLimit(req);
  if (!rate.allowed) return sendJson(res, 429, { requestId, error: '请求过于频繁，请稍后再试。' }, { 'Retry-After': String(rate.retryAfter) });
  try {
    if (activeSandboxRuns >= MAX_CONCURRENT_SANDBOXES) return sendJson(res, 503, { requestId, error: '沙箱队列已满，请稍后再试。' });
    const payload = JSON.parse(await readBody(req));
    const code = String(payload.code || '');
    const task = sandboxTasks[String(payload.taskId || '')];
    if (!task) return sendJson(res, 400, { requestId, error: '未知沙箱任务。' });
    const validationError = validateCode(code);
    if (validationError) return sendJson(res, 400, { requestId, error: validationError });
    const dir = await mkdtemp(path.join(tmpdir(), 'ljvm-'));
    try {
      await writeFile(path.join(dir, 'Main.java'), code, 'utf8');
      activeSandboxRuns += 1;
      let result;
      try {
        result = await runDocker(dir);
      } finally {
        activeSandboxRuns -= 1;
      }
      const target = `${code}\n${result.stdout}`;
      const testResults = task.tests.map(test => ({ name: test.name, pass: test.pattern.test(target) }));
      const passed = result.ok && testResults.every(test => test.pass);
      const status = result.ok && !passed ? 'tests_failed' : classifyDockerResult(result);
      const finishedAt = new Date().toISOString();
      console.info(JSON.stringify({ requestId, taskId: payload.taskId, status, passed, startedAt, finishedAt, ip: clientIp(req) }));
      const log = [
        `> requestId：${requestId}`,
        `> 任务：${task.title}`,
        `> 状态：${status}`,
        `> 后端 Java 编译运行：${result.ok ? '成功' : '失败'}`,
        `> Docker 隔离：network=none memory=128m cpus=0.5 pids=64 timeout=8s`,
        result.stdout && `> stdout:\n${result.stdout.trim()}`,
        result.stderr && `> stderr:\n${result.stderr.trim()}`,
        result.error && `> system:\n${result.error}`,
        `> 自动测试：${testResults.filter(t => t.pass).length}/${testResults.length}`,
        ...testResults.map(t => `${t.pass ? '✅' : '❌'} ${t.name}`)
      ].filter(Boolean).join('\n');
      return sendJson(res, statusToHttpStatus(status), { requestId, status, passed, log, tests: testResults, error: passed ? '' : `沙箱结果：${status}` });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(JSON.stringify({ requestId, status: 'system_error', error: error.message, startedAt, finishedAt: new Date().toISOString(), ip: clientIp(req) }));
    return sendJson(res, error.status || 500, { requestId, error: error.message || '沙箱服务错误。' });
  }
}

async function serveStatic(req, res) {
  if (decodeURIComponent(req.url.split('?')[0]).includes('..')) return sendJson(res, 403, { error: 'Forbidden' });
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) return sendJson(res, 403, { error: 'Forbidden' });
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return sendJson(res, 404, { error: 'Not found' });
    const ext = path.extname(filePath);
    const isHtml = ext === '.html';
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': isHtml ? 'no-store' : 'public, max-age=3600'
    });
    createReadStream(filePath).pipe(res);
  } catch {
    return sendJson(res, 404, { error: 'Not found' });
  }
}


function dockerVersion() {
  return new Promise(resolve => {
    execFile('docker', ['--version'], { timeout: 2000 }, (error, stdout) => {
      resolve({ available: !error, version: stdout.trim(), error: error ? error.message : '' });
    });
  });
}

function dockerImageStatus() {
  return new Promise(resolve => {
    execFile('docker', ['image', 'inspect', JAVA_IMAGE], { timeout: 3000 }, error => {
      resolve({ image: JAVA_IMAGE, present: !error, hint: error ? `请先运行：docker pull ${JAVA_IMAGE}` : '镜像已就绪' });
    });
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (requestUrl.pathname === '/api/users') return handleUsers(req, res);
  if (requestUrl.pathname === '/api/progress') return handleProgress(req, res, requestUrl);
  if (requestUrl.pathname === '/api/leaderboard') return handleLeaderboard(req, res);
  if (req.method === 'GET' && req.url === '/healthz') {
    const [docker, image] = await Promise.all([dockerVersion(), dockerImageStatus()]);
    return sendJson(res, 200, { ok: true, dockerImage: JAVA_IMAGE, docker, image, activeSandboxRuns, maxConcurrentSandboxes: MAX_CONCURRENT_SANDBOXES });
  }
  if (req.method === 'GET' && req.url === '/api/tasks') return sendJson(res, 200, { tasks: Object.fromEntries(Object.entries(sandboxTasks).map(([id, task]) => [id, { title: task.title, tests: task.tests.map(test => test.name) }])) });
  if (req.method === 'POST' && req.url === '/api/run-java') return handleJava(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed' });
  return serveStatic(req, res);
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Learn Java via Minecraft running at http://localhost:${PORT}`));
}

module.exports = { server, sandboxTasks, validateCode, statusToHttpStatus };
