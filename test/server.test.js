const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { server, validateCode, sandboxTasks, statusToHttpStatus } = require('../server');

function listen() {
  return new Promise(resolve => {
    const instance = server.listen(0, () => resolve(instance));
  });
}

function request(instance, options, body = '') {
  const { port } = instance.address();
  return new Promise((resolve, reject) => {
    const req = http.request({ port, host: '127.0.0.1', ...options }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('validateCode enforces Main class and disallowed APIs', () => {
  assert.equal(validateCode('class Demo {}'), '代码必须包含 public class Main。');
  assert.equal(validateCode('public class Main { void x(){ System.exit(0); } }'), '代码包含沙箱练习不允许的 API。');
  assert.equal(validateCode('public class Main { public static void main(String[] args){} }'), '');
});

test('sandbox status values map to distinct HTTP statuses', () => {
  assert.equal(statusToHttpStatus('success'), 200);
  assert.equal(statusToHttpStatus('tests_failed'), 422);
  assert.equal(statusToHttpStatus('compile_error'), 400);
  assert.equal(statusToHttpStatus('timeout'), 408);
  assert.equal(statusToHttpStatus('memory_limit'), 422);
  assert.equal(statusToHttpStatus('docker_unavailable'), 503);
  assert.equal(statusToHttpStatus('system_error'), 500);
});

test('server exposes healthz and server-owned task metadata', async () => {
  const instance = await listen();
  try {
    const health = await request(instance, { path: '/healthz', method: 'GET' });
    assert.equal(health.status, 200);
    const healthPayload = JSON.parse(health.body);
    assert.equal(healthPayload.ok, true);
    assert.equal(healthPayload.image.image, 'eclipse-temurin:21-jdk');

    const tasks = await request(instance, { path: '/api/tasks', method: 'GET' });
    assert.equal(tasks.status, 200);
    const payload = JSON.parse(tasks.body);
    assert.deepEqual(Object.keys(payload.tasks).sort(), Object.keys(sandboxTasks).sort());
  } finally {
    instance.close();
  }
});

test('sandbox rejects unknown task before Docker execution', async () => {
  const instance = await listen();
  try {
    const response = await request(instance, {
      path: '/api/run-java', method: 'POST', headers: { 'content-type': 'application/json' }
    }, JSON.stringify({ taskId: 'fake', code: 'public class Main {}' }));
    assert.equal(response.status, 400);
    assert.match(JSON.parse(response.body).error, /未知沙箱任务/);
  } finally {
    instance.close();
  }
});

test('static server returns 404 for missing files', async () => {
  const instance = await listen();
  try {
    const response = await request(instance, { path: '/missing-file.js', method: 'GET' });
    assert.equal(response.status, 404);
  } finally {
    instance.close();
  }
});

test('static server blocks traversal, rejects unsupported methods and sets cache headers', async () => {
  const instance = await listen();
  try {
    const traversal = await request(instance, { path: '/%2e%2e/package.json', method: 'GET' });
    assert.equal(traversal.status, 403);

    const method = await request(instance, { path: '/', method: 'POST' });
    assert.equal(method.status, 405);

    const index = await request(instance, { path: '/', method: 'GET' });
    assert.equal(index.headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(index.headers['cache-control'], 'no-store');

    const script = await request(instance, { path: '/app.js', method: 'GET' });
    assert.equal(script.headers['content-type'], 'text/javascript; charset=utf-8');
    assert.equal(script.headers['cache-control'], 'public, max-age=3600');
  } finally {
    instance.close();
  }
});


test('cloud progress and leaderboard APIs persist user score', async () => {
  const instance = await listen();
  try {
    const created = await request(instance, {
      path: '/api/users', method: 'POST', headers: { 'content-type': 'application/json' }
    }, JSON.stringify({ name: 'Test Player' }));
    assert.equal(created.status, 201);
    const user = JSON.parse(created.body).user;

    const saved = await request(instance, {
      path: `/api/progress?userId=${encodeURIComponent(user.id)}`, method: 'PUT', headers: { 'content-type': 'application/json' }
    }, JSON.stringify({ token: user.token, progress: { completedLessons: [0], completedPractices: [0, 1], completedPlugins: [], completedSandboxes: [], visitedMod: false } }));
    assert.equal(saved.status, 200);

    const loaded = await request(instance, { path: `/api/progress?userId=${encodeURIComponent(user.id)}`, method: 'GET' });
    assert.equal(JSON.parse(loaded.body).score, 60);

    const leaderboard = await request(instance, { path: '/api/leaderboard', method: 'GET' });
    assert.match(leaderboard.body, /Test Player/);
  } finally {
    instance.close();
  }
});
