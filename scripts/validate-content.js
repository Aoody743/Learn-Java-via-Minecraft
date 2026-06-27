const fs = require('node:fs');

const content = JSON.parse(fs.readFileSync('data/content.json', 'utf8'));
const errors = [];

function requireFields(collection, name, fields) {
  if (!Array.isArray(collection) || collection.length === 0) {
    errors.push(`${name} must be a non-empty array`);
    return;
  }
  collection.forEach((item, index) => {
    for (const field of fields) {
      if (item[field] === undefined || item[field] === '') errors.push(`${name}[${index}] missing ${field}`);
    }
  });
}

requireFields(content.lessons, 'lessons', ['id', 'title', 'objective', 'scene', 'concept', 'code', 'minutes', 'level']);
requireFields(content.pluginLessons, 'pluginLessons', ['title', 'goal', 'snippet', 'checkpoint']);
requireFields(content.modLessons, 'modLessons', ['title', 'goal', 'snippet', 'checkpoint']);
requireFields(content.achievements, 'achievements', ['id', 'title', 'description']);
requireFields(content.practices, 'practices', ['type', 'title', 'prompt', 'answer', 'acceptedAnswers', 'hint', 'explanation', 'whyWrong', 'xp']);

const validPracticeTypes = new Set(['blank', 'choice', 'code']);
(content.practices || []).forEach((practice, index) => {
  if (!validPracticeTypes.has(practice.type)) errors.push(`practices[${index}] has invalid type ${practice.type}`);
  if (!Array.isArray(practice.acceptedAnswers) || practice.acceptedAnswers.length === 0) errors.push(`practices[${index}] acceptedAnswers must be non-empty`);
  if (practice.type === 'choice' && (!Array.isArray(practice.options) || practice.options.length < 2)) errors.push(`practices[${index}] choice options must contain at least 2 items`);
  if (practice.type === 'code' && (!Array.isArray(practice.tests) || practice.tests.length === 0)) errors.push(`practices[${index}] code questions must define tests`);
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('content.json is valid');
