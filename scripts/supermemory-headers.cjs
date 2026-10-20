const { readFileSync } = require('node:fs');
const { homedir } = require('node:os');
const { join } = require('node:path');

try {
  const apiKey = process.env.SUPERMEMORY_CC_API_KEY || JSON.parse(
    readFileSync(join(homedir(), '.supermemory-claude/credentials.json'), 'utf8'),
  ).apiKey;
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error();
  process.stdout.write(JSON.stringify({ Authorization: `Bearer ${apiKey}` }));
} catch {
  console.error('Supermemory credential unavailable; check SUPERMEMORY_CC_API_KEY or the saved Claude credential.');
  process.exitCode = 1;
}
