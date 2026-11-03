/**
 * Run with: node --test tests/executor-safety.test.mjs
 * Static safety regression: guards against restoring Phase 0 fake verification.
 * This does NOT replace integration tests or prove production safety.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/execution/executor.ts', import.meta.url), 'utf8')

test('executor has no connector dispatch while durable ledger is unavailable', () => {
  assert.doesNotMatch(source, /\btriggerConnector\s*\(/)
  assert.doesNotMatch(source, /\bfetch\s*\(/)
})

test('executor does not fabricate a successful verification', () => {
  assert.doesNotMatch(source, /return\s+true\s*\/\/\s*Phase\s*0/i)
  assert.doesNotMatch(source, /mockId|Math\.random\(/)
  assert.match(source, /status:\s*'failed'/)
  assert.match(source, /attempts:\s*0/)
})

test('operator receives explicit reason for execution block', () => {
  assert.match(source, /Execution disabled:/)
  assert.match(source, /external read-back verification/)
})
