let lessons = [
  { era: '出生点', title: '为什么 Minecraft 可以帮你学 Java', concept: 'Java 是 Minecraft Java Edition 和大量服务器插件生态的重要语言。学习 Java 可以从玩家、方块、物品、事件这些熟悉对象开始。', scene: '服务器启动时会加载插件、注册命令和监听事件，这些都对应 Java 程序的入口、对象和方法调用。', code: 'public class FirstPlugin {\n    public void onEnable() {\n        System.out.println("服务器插件启动！");\n    }\n}' },
  { era: '木头时代', title: '变量与数据类型：记录玩家血量和等级', concept: '变量是给数据起名字；int、double、boolean、String 是常见数据类型。', scene: '玩家 Steve 满血 20 点，等级 5，是否拥有 OP 权限可以用 boolean 保存。', code: 'String playerName = "Steve";\nint health = 20;\nint level = 5;\ndouble x = 100.5;\nboolean op = false;' },
  { era: '木镐时代', title: '字符串：玩家名称和聊天消息', concept: 'String 用来保存文字，常用于玩家名、聊天内容、插件提示。', scene: '玩家加入服务器时，插件拼接一条欢迎消息。', code: 'String name = "Alex";\nString message = "欢迎 " + name + " 来到服务器！";\nSystem.out.println(message);' },
  { era: '石器时代', title: 'if 判断：玩家是否死亡', concept: 'if 根据条件决定是否执行代码。条件结果只有 true 或 false。', scene: '如果玩家血量小于等于 0，就判定死亡。', code: 'int health = 0;\nif (health <= 0) {\n    System.out.println("玩家死亡");\n} else {\n    System.out.println("玩家仍然存活");\n}' },
  { era: '熔炉时代', title: 'for 循环：给所有在线玩家发公告', concept: '循环可以重复执行代码。增强 for 常用于遍历集合。', scene: '服务器重启前，给每个在线玩家发送公告。', code: 'String[] players = {"Steve", "Alex", "Notch"};\nfor (String player : players) {\n    System.out.println(player + " 收到重启公告");\n}' },
  { era: '铁器时代', title: '方法：封装传送玩家逻辑', concept: '方法把一段可复用逻辑封装起来，避免重复代码。', scene: '插件多处需要把玩家传送到出生点，可以写成一个方法。', code: 'public void teleportToSpawn(String playerName) {\n    System.out.println(playerName + " 被传送到出生点");\n}' },
  { era: '钻石时代', title: '类和对象：设计一个 Zombie 类', concept: '类是模板，对象是由模板创建出的具体实例。', scene: '普通僵尸和强化僵尸都来自 Zombie 类，但血量和伤害不同。', code: 'public class Zombie {\n    private int health;\n    private int damage;\n\n    public Zombie(int health, int damage) {\n        this.health = health;\n        this.damage = damage;\n    }\n}' },
  { era: '附魔时代', title: 'List 集合：管理在线玩家列表', concept: 'List 可以保存一组有顺序的数据，适合管理在线玩家、背包物品等。', scene: '插件维护在线玩家名称列表，并逐个输出。', code: 'List<String> onlinePlayers = List.of("Steve", "Alex");\nfor (String player : onlinePlayers) {\n    System.out.println(player);\n}' },
  { era: '绿宝石时代', title: 'Map 集合：制作金币系统', concept: 'Map 保存键值对，例如玩家名对应金币余额。', scene: '金币插件用玩家名查询和修改余额。', code: 'Map<String, Integer> money = new HashMap<>();\nmoney.put("Steve", 100);\nSystem.out.println(money.get("Steve"));' },
  { era: '红石时代', title: '事件思想：玩家加入服务器时触发欢迎消息', concept: '事件驱动是插件开发核心：事情发生后，监听器执行对应代码。', scene: '玩家加入服务器触发 PlayerJoinEvent，插件给玩家发欢迎消息。', code: '@EventHandler\npublic void onPlayerJoin(PlayerJoinEvent event) {\n    Player player = event.getPlayer();\n    player.sendMessage("欢迎来到服务器！");\n}' }
];

let pluginLessons = [
  { title: 'Spigot / Paper 插件结构', goal: '认识 src/main/java、resources、构建脚本和输出 jar。', snippet: 'src/main/java/me/demo/LearnPlugin.java\nsrc/main/resources/plugin.yml\nbuild/libs/LearnPlugin.jar' },
  { title: 'JavaPlugin 主类', goal: '理解 onEnable 和 onDisable 是插件生命周期入口。', snippet: 'public final class LearnPlugin extends JavaPlugin {\n    @Override public void onEnable() {\n        getLogger().info("插件启动");\n    }\n}' },
  { title: 'plugin.yml', goal: '声明插件名称、版本、主类、命令和权限。', snippet: 'name: LearnPlugin\nversion: 1.0.0\nmain: me.demo.LearnPlugin\napi-version: 1.20\ncommands:\n  money:\n    description: 查看金币' },
  { title: '命令系统', goal: '使用 onCommand 读取参数并给玩家反馈。', snippet: 'if (command.getName().equalsIgnoreCase("money")) {\n    sender.sendMessage("你的金币：100");\n}' },
  { title: '事件系统', goal: '用 Listener 和 @EventHandler 响应玩家行为。', snippet: '@EventHandler\npublic void onJoin(PlayerJoinEvent event) {\n    event.getPlayer().sendMessage("欢迎！");\n}' },
  { title: '权限系统', goal: '用 permission 判断玩家是否可以执行管理命令。', snippet: 'if (!sender.hasPermission("learn.admin")) {\n    sender.sendMessage("你没有权限");\n    return true;\n}' },
  { title: '配置文件', goal: '读取 config.yml 中的欢迎语、金币倍率和开关。', snippet: 'saveDefaultConfig();\nString message = getConfig().getString("welcome");' },
  { title: '小插件实战项目', goal: '组合事件、命令、权限和配置，制作欢迎与金币插件。', snippet: '/money 查看余额\n/pay <player> <amount> 转账\nPlayerJoinEvent 发送欢迎消息' }
];

let modLessons = [
  { title: 'Forge / Fabric 基础', goal: '理解 MOD 加载器、入口类和注册流程。', snippet: 'public class LearnMod {\n    public static final String MOD_ID = "learnmod";\n}' },
  { title: '方块注册', goal: '学习 Registry 注册自定义方块。', snippet: 'Registry.register(Registries.BLOCK, id("ruby_block"), RUBY_BLOCK);' },
  { title: '物品注册', goal: '为自定义材料、工具和方块物品创建注册项。', snippet: 'Registry.register(Registries.ITEM, id("ruby"), new Item(settings));' },
  { title: '事件总线', goal: '理解 MOD 事件回调与插件 Listener 的相似点。', snippet: 'ServerTickEvents.END_SERVER_TICK.register(server -> { });' },
  { title: '资源文件', goal: '认识 assets 下的模型、贴图、语言文件。', snippet: 'assets/learnmod/models/item/ruby.json\nassets/learnmod/textures/item/ruby.png' },
  { title: '数据包', goal: '使用 data 目录声明合成表、掉落表和标签。', snippet: 'data/learnmod/recipes/ruby_block.json' },
  { title: '客户端与服务端区别', goal: '区分渲染、按键等客户端逻辑和世界数据、规则等服务端逻辑。', snippet: 'ClientModInitializer 处理客户端显示；Server 负责权威逻辑。' }
];

let practices = [
  { type: 'blank', title: '判断玩家死亡', prompt: '当 health 为 0 时，if 条件应该写什么？', before: 'if (', after: ') { 输出("玩家死亡"); }', answer: 'health <= 0', xp: 20 },
  { type: 'blank', title: '遍历玩家名', prompt: '补全变量名，让每个玩家收到消息。', before: 'System.out.println(', after: ' + " 收到欢迎消息");', answer: 'player', xp: 20 },
  { type: 'blank', title: '读取金币余额', prompt: 'Map 中用什么方法根据玩家名取余额？', before: 'money.', after: '("Steve");', answer: 'get', xp: 20 },
  { type: 'choice', title: '插件启动入口', prompt: 'Paper 插件启动时通常会调用哪个生命周期方法？', options: ['onEnable', 'main', 'startGame'], answer: 'onEnable', xp: 30 },
  { type: 'choice', title: '事件注解', prompt: '哪个注解表示这是一个事件处理方法？', options: ['@EventHandler', '@MinecraftBlock', '@RunCommand'], answer: '@EventHandler', xp: 30 },
  { type: 'code', title: '欢迎消息补全', prompt: '补全代码，让玩家加入时收到欢迎消息。', starter: 'Player player = event.getPlayer();\nplayer._____("欢迎来到服务器！");', answer: 'sendMessage', xp: 40 }
];

let sandboxTasks = [
  { id: 'health_check', title: '生命值判定', goal: '写出 health <= 0 判断玩家死亡。', starter: 'public class Main {\n    public static void main(String[] args) {\n        int health = 0;\n        if (health <= 0) {\n            System.out.println("玩家死亡");\n        }\n    }\n}', tests: [{ name: '包含死亡判断', pattern: /health\s*<=\s*0/ }, { name: '输出玩家死亡', pattern: /玩家死亡/ }] },
  { id: 'welcome_message', title: '欢迎命令', goal: '用标准输出模拟 sendMessage 欢迎内容。', starter: 'public class Main {\n    public static void main(String[] args) {\n        String player = "Steve";\n        System.out.println("欢迎 " + player + " 来到服务器！");\n    }\n}', tests: [{ name: '输出欢迎内容', pattern: /System\.out\.println\s*\(/ }, { name: '包含欢迎内容', pattern: /欢迎/ }] },
  { id: 'money_map', title: '金币 Map', goal: '使用 put 保存余额，使用 get 读取余额。', starter: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Map<String, Integer> money = new HashMap<>();\n        money.put("Steve", 100);\n        System.out.println(money.get("Steve"));\n    }\n}', tests: [{ name: '保存余额 put', pattern: /\.put\s*\(/ }, { name: '读取余额 get', pattern: /\.get\s*\(/ }] }
];

let achievements = [
  { id: 'first_lesson', title: '砍下第一棵树', description: '完成任意一节 Java 基础课。' },
  { id: 'plugin_path', title: '插件工匠', description: '完成 3 个插件任务。' },
  { id: 'challenge_runner', title: '挑战者', description: '完成 3 道互动题。' },
  { id: 'sandbox_pass', title: '安全执行者', description: '通过 1 次后端沙箱测试。' },
  { id: 'mod_starter', title: 'MOD 入门者', description: '浏览 MOD 原理课程。' }
];

const completed = new Set(JSON.parse(localStorage.getItem('completedLessons') || '[]'));
const completedPlugins = new Set(JSON.parse(localStorage.getItem('completedPlugins') || '[]'));
const completedPractices = new Set(JSON.parse(localStorage.getItem('completedPractices') || '[]'));
const completedSandboxes = new Set(JSON.parse(localStorage.getItem('completedSandboxes') || '[]'));
const practiceAttempts = JSON.parse(localStorage.getItem('practiceAttempts') || '{}');
let previousUnlockedAchievements = new Set(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
let activeLesson = 0;
let activeSandbox = 0;
let monacoEditor = null;
let cloudUser = JSON.parse(localStorage.getItem('cloudUser') || 'null');
let sandboxHealth = null;

function saveProgress() {
  localStorage.setItem('completedLessons', JSON.stringify([...completed]));
  localStorage.setItem('completedPlugins', JSON.stringify([...completedPlugins]));
  localStorage.setItem('completedPractices', JSON.stringify([...completedPractices]));
  localStorage.setItem('completedSandboxes', JSON.stringify([...completedSandboxes]));
}

function setAppStatus(type, message) {
  const target = document.getElementById('appStatus');
  if (!target) return;
  target.className = `app-status ${type}`;
  target.textContent = message;
}

function currentProgressPayload() {
  return {
    completedLessons: [...completed],
    completedPlugins: [...completedPlugins],
    completedPractices: [...completedPractices],
    completedSandboxes: [...completedSandboxes],
    visitedMod: localStorage.getItem('visitedMod') === 'true'
  };
}

function applyProgressPayload(progress = {}) {
  for (const value of progress.completedLessons || []) completed.add(value);
  for (const value of progress.completedPlugins || []) completedPlugins.add(value);
  for (const value of progress.completedPractices || []) completedPractices.add(value);
  for (const value of progress.completedSandboxes || []) completedSandboxes.add(value);
  if (progress.visitedMod) localStorage.setItem('visitedMod', 'true');
  saveProgress();
}

function getXp() {
  return practices.reduce((sum, item, index) => completedPractices.has(index) ? sum + item.xp : sum, 0) + completedSandboxes.size * 50;
}

function renderProgress() {
  const total = lessons.length + pluginLessons.length + modLessons.length;
  const done = completed.size + completedPlugins.size + (localStorage.getItem('visitedMod') === 'true' ? modLessons.length : 0);
  const percent = Math.round((done / total) * 100);
  document.getElementById('progressText').textContent = `完成 ${completed.size} / ${lessons.length} 课 · ${completedPlugins.size} / ${pluginLessons.length} 插件任务`;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressMeter')?.setAttribute('aria-valuenow', String(percent));
  document.getElementById('xpText').textContent = `XP：${getXp()}`;
  document.getElementById('syncStatus').textContent = cloudUser ? `已登录：${cloudUser.name}` : '未登录时使用本地进度。';
}

function renderRoadmap() {
  document.getElementById('roadmapList').innerHTML = lessons.map((lesson, index) => `
    <button class="roadmap-node ${completed.has(index) ? 'done' : ''} ${index === activeLesson ? 'current' : ''} ${index > completed.size + 1 ? 'locked' : ''}" data-lesson="${index}">
      <span>${completed.has(index) ? '已完成' : index === activeLesson ? '推荐下一课' : lesson.era} · ${lesson.minutes || 10} 分钟</span>
      <strong>${lesson.title}</strong>
    </button>
  `).join('');
}

function renderLessons() {
  document.getElementById('lessonList').innerHTML = lessons.map((lesson, index) => `
    <button class="lesson-button ${index === activeLesson ? 'active' : ''}" data-lesson="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      ${lesson.title}
      ${completed.has(index) ? '✅' : ''}
    </button>
  `).join('');
  const picker = document.getElementById('lessonPicker');
  if (picker) {
    picker.innerHTML = lessons.map((lesson, index) => `<option value="${index}" ${index === activeLesson ? 'selected' : ''}>${index + 1}. ${escapeHtml(lesson.title)}</option>`).join('');
  }
  const lesson = lessons[activeLesson];
  document.getElementById('lessonDetail').innerHTML = `
    <p class="eyebrow">${lesson.era}</p>
    <h3 id="lessonTitle" tabindex="-1">${lesson.title}</h3>
    <nav class="lesson-toc" aria-label="本课目录">
      <a href="#lesson-goal">目标</a><a href="#lesson-scene">场景</a><a href="#lesson-code">代码</a><a href="#lesson-mistakes">易错点</a><a href="#lesson-checkpoint">检查点</a>
    </nav>
    <section class="lesson-section" id="lesson-goal"><p><strong>学习目标：</strong>${lesson.objective || '理解本节核心概念。'}</p><p><strong>Java 概念：</strong>${lesson.concept}</p></section>
    <section class="lesson-section" id="lesson-scene"><div class="minecraft-scene"><strong>MC 场景：</strong>${lesson.scene}</div><p><strong>讲解：</strong>${lesson.explanation || lesson.concept}</p></section>
    <section class="lesson-section" id="lesson-code"><h4>代码拆解</h4><ol>${(lesson.breakdown || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol><pre><code>${escapeHtml(lesson.code)}</code></pre></section>
    <section class="lesson-section" id="lesson-mistakes"><div class="tip-box"><strong>常见错误：</strong><ul>${(lesson.mistakes || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div></section>
    <section class="lesson-section" id="lesson-checkpoint"><p><strong>本节练习：</strong>${lesson.exercise || '完成下方挑战。'}</p><p><strong>检查点：</strong>${lesson.checkpoint || '完成本节练习。'}</p><p><strong>总结：</strong>${lesson.summary || '继续下一节。'}</p></section>
    <div class="next-step">下一步：完成本节后继续学习「${lessons[activeLesson + 1]?.title || '插件开发路线'}」。</div>
    <button class="button primary" id="completeLesson">${completed.has(activeLesson) ? '已完成，再复习一次' : '标记本课完成'}</button>
  `;
}

function renderCardGrid(id, items, type) {
  document.getElementById(id).innerHTML = items.map((item, index) => `
    <article class="plugin-card ${type === 'plugin' && completedPlugins.has(index) ? 'done' : ''}">
      <span>${type === 'plugin' ? '插件任务' : 'MOD 课程'} ${index + 1}</span>
      <h3>${item.title}</h3>
      <p>${item.goal}</p>
      ${(item.steps || []).length ? `<ol>${item.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>` : ''}
      <pre><code>${escapeHtml(item.snippet)}</code></pre>
      ${item.checkpoint ? `<p class="next-step">检查点：${escapeHtml(item.checkpoint)}</p>` : ''}
      ${type === 'plugin' ? `<button class="button secondary" data-plugin="${index}">${completedPlugins.has(index) ? '已掌握' : '标记掌握'}</button>` : ''}
    </article>
  `).join('');
}

function renderPractices() {
  document.getElementById('practiceGrid').innerHTML = practices.map((item, index) => {
    const attempts = practiceAttempts[index] || 0;
    const body = item.type === 'choice'
      ? `<div class="choices">${item.options.map(option => `<button class="choice" data-answer="${escapeHtml(option)}" data-practice="${index}">${option}</button>`).join('')}</div>`
      : item.type === 'code'
        ? `<pre><code>${escapeHtml(item.starter)}</code></pre><input id="answer-${index}" placeholder="输入补全内容" aria-label="代码补全答案" />`
        : `<label><code>${item.before}</code><input id="answer-${index}" placeholder="输入答案" aria-label="练习答案" /><code>${item.after}</code></label>`;
    return `
      <article class="practice-card ${completedPractices.has(index) ? 'done' : ''}">
        <span>${item.type.toUpperCase()} · +${item.xp} XP</span>
        <h3>${item.title}</h3>
        <p>${item.prompt}</p>
        ${body}
        ${item.type === 'choice' ? '' : `<button class="button secondary" data-practice="${index}">提交答案</button>`}
        <p class="feedback" id="feedback-${index}" aria-live="polite">${completedPractices.has(index) ? `✅ 已完成：${item.explanation || '答案已经通过。'}` : attempts ? `已尝试 ${attempts} 次，继续调整答案。` : ''}</p>
      </article>
    `;
  }).join('');
}

function getUnlockedAchievements() {
  const unlocked = new Set();
  if (completed.size > 0) unlocked.add('first_lesson');
  if (completedPlugins.size >= 3) unlocked.add('plugin_path');
  if (completedPractices.size >= 3) unlocked.add('challenge_runner');
  if (completedSandboxes.size >= 1) unlocked.add('sandbox_pass');
  if (localStorage.getItem('visitedMod') === 'true') unlocked.add('mod_starter');
  return unlocked;
}

function showAchievementToast(item) {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `<strong>🏆 解锁成就：${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p>`;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

function renderAchievements() {
  const unlocked = getUnlockedAchievements();
  for (const id of unlocked) {
    if (!previousUnlockedAchievements.has(id)) {
      const item = achievements.find(achievement => achievement.id === id);
      if (item) showAchievementToast(item);
    }
  }
  previousUnlockedAchievements = unlocked;
  localStorage.setItem('unlockedAchievements', JSON.stringify([...unlocked]));
  document.getElementById('achievementGrid').innerHTML = achievements.map(item => `
    <article class="achievement-card ${unlocked.has(item.id) ? 'done' : ''}">
      <strong>${unlocked.has(item.id) ? '🏆' : '🔒'} ${item.title}</strong>
      <p>${item.description}</p>
    </article>
  `).join('');
}

async function renderLeaderboard() {
  const score = getXp() + completed.size * 10 + completedPlugins.size * 15 + completedSandboxes.size * 40;
  let rows = [{ name: cloudUser?.name || '你（本地）', score, updatedAt: new Date().toISOString() }];
  let source = cloudUser ? '云端排行榜' : '本地得分预览，不参与云端排名';
  try {
    const response = await fetch('/api/leaderboard');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.leaderboard) && data.leaderboard.length) rows = data.leaderboard;
    } else {
      source = '排行榜服务不可用，显示本地得分预览';
    }
  } catch {
    source = '排行榜服务不可用，显示本地得分预览';
  }
  document.getElementById('leaderboardCard').innerHTML = `<p class="leaderboard-meta">${source}</p><ol>${rows.sort((a, b) => b.score - a.score).map((row, index) => {
    const isCurrent = cloudUser && row.userId === cloudUser.id;
    return `<li class="${isCurrent ? 'current-user' : ''}"><span>#${index + 1}</span><strong>${escapeHtml(row.name)}${isCurrent ? '（你）' : ''}<span class="leaderboard-meta">${new Date(row.updatedAt).toLocaleString()}</span></strong><span>${row.score} 分</span></li>`;
  }).join('')}</ol>`;
}

function renderSandbox(resetEditor = true) {
  document.getElementById('sandboxList').innerHTML = sandboxTasks.map((task, index) => `
    <button class="lesson-button ${index === activeSandbox ? 'active' : ''} ${completedSandboxes.has(index) ? 'done' : ''}" data-sandbox="${index}">
      <span>自动测试 ${index + 1}</span>${task.title}${completedSandboxes.has(index) ? ' ✅' : ''}
    </button>
  `).join('');
  const picker = document.getElementById('sandboxPicker');
  if (picker) {
    picker.innerHTML = sandboxTasks.map((task, index) => `<option value="${index}" ${index === activeSandbox ? 'selected' : ''}>${index + 1}. ${escapeHtml(task.title)}</option>`).join('');
  }
  const task = sandboxTasks[activeSandbox];
  document.getElementById('sandboxTitle').textContent = task.title;
  document.getElementById('sandboxGoal').textContent = task.goal;
  if (resetEditor) {
    setEditorValue(task.starter);
    document.getElementById('consoleOutput').textContent = '点击“运行后端沙箱测试”编译运行 Java，并执行自动测试用例。';
    renderSandboxTests([]);
  }
}

function renderSandboxTests(tests = []) {
  const target = document.getElementById('testResults');
  if (!target) return;
  target.innerHTML = tests.length
    ? tests.map(test => `<div class="test-result ${test.pass ? 'test-pass' : 'test-fail'}">${test.pass ? '通过' : '失败'}：${escapeHtml(test.name)}</div>`).join('')
    : '<div class="test-result">运行后会在这里显示每条自动测试的通过/失败结果。</div>';
}

function renderSandboxHealth() {
  const target = document.getElementById('sandboxHealth');
  if (!target) return;
  if (!sandboxHealth) {
    target.className = 'status-board warn';
    target.textContent = '正在检查后端沙箱健康状态...';
    return;
  }
  const dockerReady = sandboxHealth.docker?.available;
  const imageReady = sandboxHealth.image?.present;
  target.className = `status-board ${dockerReady && imageReady ? 'ok' : 'error'}`;
  target.textContent = dockerReady && imageReady
    ? `✅ 后端沙箱可用：${sandboxHealth.docker.version}，镜像 ${sandboxHealth.image.image} 已就绪，并发 ${sandboxHealth.activeSandboxRuns}/${sandboxHealth.maxConcurrentSandboxes}。`
    : `⚠️ 后端沙箱不可用或未就绪：${sandboxHealth.docker?.error || sandboxHealth.image?.hint || '请启动 Node 服务并安装 Docker。'}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function normalize(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function setEditorValue(value) {
  if (monacoEditor) monacoEditor.setValue(value);
  document.getElementById('codeEditor').value = value;
}

function getEditorValue() {
  return monacoEditor ? monacoEditor.getValue() : document.getElementById('codeEditor').value;
}

function initMonaco() {
  const monacoStatus = document.getElementById('monacoStatus');
  if (!window.require) {
    monacoStatus.textContent = 'Monaco CDN 未加载，已启用本地 textarea 编辑器；断网也可以继续练习。';
    return;
  }
  window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
  window.require(['vs/editor/editor.main'], () => {
    document.getElementById('codeEditor').classList.add('hidden-editor');
    monacoStatus.textContent = 'Monaco Editor 已加载；如果后续网络中断，textarea 兜底编辑器仍保留代码。';
    monacoEditor = monaco.editor.create(document.getElementById('monacoEditor'), {
      value: sandboxTasks[activeSandbox].starter,
      language: 'java',
      theme: 'vs-dark',
      minimap: { enabled: false },
      automaticLayout: true
    });
  }, error => {
    console.warn('Monaco 加载失败，使用 textarea。', error);
    monacoStatus.textContent = 'Monaco CDN 加载失败，已启用本地 textarea 编辑器。';
  });
}

function isPracticeCorrect(item, value) {
  if (Array.isArray(item.tests) && item.tests.length) {
    return item.tests.every(test => new RegExp(test.pattern).test(value));
  }
  return (item.acceptedAnswers || [item.answer]).map(normalize).includes(normalize(value));
}

function completePractice(index, isCorrect) {
  const feedback = document.getElementById(`feedback-${index}`);
  practiceAttempts[index] = (practiceAttempts[index] || 0) + 1;
  localStorage.setItem('practiceAttempts', JSON.stringify(practiceAttempts));
  if (isCorrect) {
    completedPractices.add(index);
    saveProgress();
    feedback.innerHTML = `<span>✅ 正确！获得 ${practices[index].xp} XP。</span><div class="feedback-panel">${escapeHtml(practices[index].explanation || '你已经掌握了这道题的核心概念。')}</div>`;
    feedback.className = 'feedback success';
    renderProgress();
    renderAchievements();
    renderLeaderboard();
  } else {
    feedback.innerHTML = `<span>❌ 错误提示：${escapeHtml(practices[index].hint || '检查变量名、方法名、大小写或插件 API 名称。')}</span><div class="feedback-panel">为什么错：${escapeHtml(practices[index].whyWrong || '当前答案没有满足题目要求。请对照变量名、API 名称或条件表达式重新检查。')}${practiceAttempts[index] >= 2 ? `<br>参考思路：${escapeHtml((practices[index].acceptedAnswers || [practices[index].answer]).join(' / '))}` : ''}</div>`;
    feedback.className = 'feedback error';
  }
}

async function runSandbox() {
  const task = sandboxTasks[activeSandbox];
  const code = getEditorValue();
  const output = document.getElementById('consoleOutput');
  const runButton = document.getElementById('runSandbox');
  runButton.disabled = true;
  runButton.textContent = '沙箱运行中...';
  runButton.setAttribute('aria-busy', 'true');
  output.textContent = '> 正在提交到后端 Docker 沙箱...';
  try {
    const response = await fetch('/api/run-java', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, code })
    });
    const data = await response.json();
    if (!response.ok && data.log) {
      output.textContent = data.log;
      renderSandboxTests(data.tests || []);
      throw new Error(data.error || `沙箱状态：${data.status || response.status}`);
    }
    if (!response.ok) throw new Error(data.error || '沙箱服务返回错误');
    if (data.passed) {
      completedSandboxes.add(activeSandbox);
      saveProgress();
    }
    output.textContent = data.log;
    renderSandboxTests(data.tests || []);
  } catch (error) {
    if (output.textContent.includes('requestId：')) {
      output.textContent += `\n> 用户提示：${error.message}`;
      renderProgress();
      renderAchievements();
      renderLeaderboard();
      renderSandbox(false);
    } else {
      const results = task.tests.map(test => ({ name: test.name, pass: test.pattern.test(code) }));
      renderSandboxTests(results);
      output.textContent = [
        '> 后端沙箱不可用，已降级为前端目标检查。',
        `> 原因：${error.message}`,
        `> 前端检查：${results.filter(result => result.pass).length}/${results.length}`,
        ...results.map(result => `${result.pass ? '✅' : '❌'} ${result.name}`)
      ].join('\n');
    }
  }
  renderProgress();
  renderAchievements();
  renderLeaderboard();
  renderSandbox(false);
  runButton.disabled = false;
  runButton.textContent = '运行后端沙箱测试';
  runButton.removeAttribute('aria-busy');
}


async function loadContent() {
  try {
    const response = await fetch('data/content.json', { cache: 'no-store' });
    if (!response.ok) return;
    const content = await response.json();
    if (Array.isArray(content.lessons) && content.lessons.length) lessons = content.lessons;
    if (Array.isArray(content.pluginLessons) && content.pluginLessons.length) pluginLessons = content.pluginLessons;
    if (Array.isArray(content.modLessons) && content.modLessons.length) modLessons = content.modLessons;
    if (Array.isArray(content.practices) && content.practices.length) practices = content.practices;
    if (Array.isArray(content.achievements) && content.achievements.length) achievements = content.achievements;
    setAppStatus('info', '课程内容已加载，可以开始学习。');
  } catch (error) {
    console.warn('课程内容加载失败，使用内置内容。', error);
    setAppStatus('warn', '课程数据加载失败，已使用内置课程内容。');
  }
}

function renderAll({ resetSandbox = false } = {}) {
  renderProgress();
  renderRoadmap();
  renderLessons();
  renderCardGrid('pluginGrid', pluginLessons, 'plugin');
  renderCardGrid('modGrid', modLessons, 'mod');
  renderPractices();
  renderAchievements();
  renderLeaderboard();
  renderSandbox(resetSandbox);
  renderSandboxHealth();
}

async function loadSandboxHealth() {
  try {
    const response = await fetch('/healthz', { cache: 'no-store' });
    sandboxHealth = await response.json();
  } catch (error) {
    sandboxHealth = { docker: { available: false, error: '后端服务不可用：' + error.message }, image: { present: false, hint: '请先运行 npm start。' } };
    setAppStatus('warn', '当前可能处于静态模式：后端沙箱、云端同步和排行榜可能不可用。');
  }
  renderSandboxHealth();
}

async function syncCloudProgress() {
  const status = document.getElementById('syncStatus');
  const name = document.getElementById('profileName').value || cloudUser?.name || 'Minecraft 学徒';
  status.textContent = '正在同步云端进度...';
  setAppStatus('warn', '正在同步云端进度：创建/读取用户、上传本地进度并合并云端记录。');
  try {
    if (!cloudUser) {
      const createResponse = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const createData = await createResponse.json();
      if (!createResponse.ok) throw new Error(createData.error || '创建用户失败');
      cloudUser = createData.user;
      localStorage.setItem('cloudUser', JSON.stringify(cloudUser));
    }
    const pushResponse = await fetch(`/api/progress?userId=${encodeURIComponent(cloudUser.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: cloudUser.token, progress: currentProgressPayload() }) });
    const pushData = await pushResponse.json();
    if (!pushResponse.ok) throw new Error(pushData.error || '同步失败');
    const pullResponse = await fetch(`/api/progress?userId=${encodeURIComponent(cloudUser.id)}`);
    if (pullResponse.ok) {
      const pullData = await pullResponse.json();
      applyProgressPayload(pullData.progress);
    }
    status.textContent = `云端进度已同步：${cloudUser.name}`;
    setAppStatus('info', `云端进度已同步：${cloudUser.name}`);
    renderAll({ resetSandbox: false });
  } catch (error) {
    status.textContent = `同步失败：${error.message}`;
    setAppStatus('error', `云端同步失败：${error.message}`);
  }
}

document.addEventListener('click', event => {
  const lessonButton = event.target.closest('[data-lesson]');
  if (lessonButton) {
    activeLesson = Number(lessonButton.dataset.lesson);
    renderRoadmap();
    renderLessons();
    document.getElementById('lessonTitle')?.focus();
    document.getElementById('lessons').scrollIntoView({ behavior: 'smooth' });
  }

  const sandboxButton = event.target.closest('[data-sandbox]');
  if (sandboxButton) {
    activeSandbox = Number(sandboxButton.dataset.sandbox);
    renderSandbox(true);
  }

  const pluginButton = event.target.closest('[data-plugin]');
  if (pluginButton) {
    completedPlugins.add(Number(pluginButton.dataset.plugin));
    saveProgress();
    renderAll({ resetSandbox: false });
  }

  if (event.target.id === 'completeLesson') {
    completed.add(activeLesson);
    saveProgress();
    renderAll({ resetSandbox: false });
  }

  if (event.target.id === 'runSandbox') runSandbox();

  if (event.target.id === 'resetSandboxCode') renderSandbox(true);

  if (event.target.id === 'clearConsole') document.getElementById('consoleOutput').textContent = '控制台已清空。';

  if (event.target.id === 'copySandboxCode') navigator.clipboard?.writeText(getEditorValue()).then(() => setAppStatus('info', '已复制当前代码。'));

  if (event.target.id === 'copyConsole') navigator.clipboard?.writeText(document.getElementById('consoleOutput').textContent).then(() => setAppStatus('info', '已复制控制台输出。'));

  if (event.target.id === 'syncProfile') syncCloudProgress();

  if (event.target.id === 'resetProgress') {
    localStorage.removeItem('completedLessons');
    localStorage.removeItem('completedPlugins');
    localStorage.removeItem('completedPractices');
    localStorage.removeItem('completedSandboxes');
    localStorage.removeItem('visitedMod');
    location.reload();
  }

  const practiceButton = event.target.closest('[data-practice]');
  if (practiceButton && !practiceButton.classList.contains('choice')) {
    const index = Number(practiceButton.dataset.practice);
    const input = document.getElementById(`answer-${index}`);
    completePractice(index, isPracticeCorrect(practices[index], input.value));
  }

  const choiceButton = event.target.closest('.choice[data-practice]');
  if (choiceButton) {
    const index = Number(choiceButton.dataset.practice);
    completePractice(index, isPracticeCorrect(practices[index], choiceButton.dataset.answer));
  }
});

document.getElementById('mod').addEventListener('mouseenter', () => {
  localStorage.setItem('visitedMod', 'true');
  renderProgress();
  renderAchievements();
});

document.addEventListener('change', event => {
  if (event.target.id === 'lessonPicker') {
    activeLesson = Number(event.target.value);
    renderRoadmap();
    renderLessons();
    document.getElementById('lessonTitle')?.focus();
  }
  if (event.target.id === 'sandboxPicker') {
    activeSandbox = Number(event.target.value);
    renderSandbox(true);
  }
});

loadContent().then(() => {
  renderAll({ resetSandbox: true });
  initMonaco();
  loadSandboxHealth();
});
