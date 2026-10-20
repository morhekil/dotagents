const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

function run(t, { stored, override = '' } = {}) {
  const home = mkdtempSync(join(tmpdir(), 'supermemory-headers-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  if (stored !== undefined) {
    mkdirSync(join(home, '.supermemory-claude'));
    writeFileSync(join(home, '.supermemory-claude/credentials.json'), stored);
  }
  return spawnSync(process.execPath, [join(__dirname, '../scripts/supermemory-headers.cjs')], {
    env: { ...process.env, HOME: home, SUPERMEMORY_CC_API_KEY: override },
    encoding: 'utf8',
  });
}

test('uses the saved personal credential', (t) => {
  const result = run(t, { stored: JSON.stringify({ apiKey: 'personal-test' }) });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { Authorization: 'Bearer personal-test' });
});

test('organization environment overrides the saved personal credential', (t) => {
  const result = run(t, { stored: 'invalid json', override: 'organization-test' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { Authorization: 'Bearer organization-test' });
});

for (const stored of [undefined, '{}', 'invalid json']) {
  test(`fails without exposing credentials when saved credentials are ${stored}`, (t) => {
    const result = run(t, { stored });
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Supermemory credential unavailable/);
  });
}
