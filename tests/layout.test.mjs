import assert from 'node:assert'
import * as lay from '../shared/layout.js'
import * as vibe from '../shared/vibe.js'

let n = 0
function t(name, f) { f(); n++; console.log('ok  ' + name) }
const CX = 198, SZ = 60, STEP = 64

t('высота: допустимые значения как есть, мусор — весь экран', () => {
  assert.equal(lay.cleanH(450), 450)
  assert.equal(lay.cleanH('480'), 480)
  assert.equal(lay.cleanH(100), lay.FULL_H)
  assert.equal(lay.cleanH(9999), lay.FULL_H)
  assert.equal(lay.cleanH(undefined), lay.FULL_H)
})

t('три равные строки экрана', () => {
  assert.equal(lay.rowH(514), 171)
  assert.equal(lay.rowH(450), 150)
})

t('нижний ряд кнопок помещается и при 514, и при 450 (кнопка 120 px по центру своей строки)', () => {
  for (const h of [514, 450]) {
    const row = lay.rowH(h)
    const bottom = row * 2 + Math.round((row - 120) / 2) + 120
    assert.ok(bottom <= h, 'не помещается при ' + h + ': ' + bottom)
  }
})

t('очередь по центру: центр группы всегда 198 (для 1..6 значков)', () => {
  for (let k = 1; k <= 6; k++) {
    const x0 = lay.queueX0(k, CX, SZ, STEP)
    const x1 = x0 + (k - 1) * STEP + SZ
    assert.equal((x0 + x1) / 2, CX, 'значков: ' + k)
  }
  assert.equal(lay.queueX0(6, CX, SZ, STEP), 8)    // шесть значков занимают ту же ширину, что сетка кнопок
  assert.equal(lay.queueX0(1, CX, SZ, STEP), 168)
})

t('блок по центру по высоте и не выше нуля', () => {
  assert.equal(lay.centerTop(514, 323), 96)
  assert.equal(lay.centerTop(450, 323), 64)
  assert.equal(lay.centerTop(300, 400), 0)
})

t('вид с телефона: по умолчанию полоска скрыта', () => {
  assert.deepEqual(lay.cleanView({ h: 450, hide: 0 }), { h: 450, hide: 0 })
  assert.deepEqual(lay.cleanView({ h: 514, hide: 1 }), { h: 514, hide: 1 })
  assert.deepEqual(lay.cleanView(null), { h: lay.FULL_H, hide: 1 })
  assert.deepEqual(lay.cleanView({ h: 7 }), { h: lay.FULL_H, hide: 1 })
})

t('вибрация: метка моложе окна — «уже вибрировали»', () => {
  const now = 1000000
  assert.equal(vibe.recentlyVibrated(now - 1000, now), true)
  assert.equal(vibe.recentlyVibrated(now - vibe.VIB_DEDUPE, now), false)
  assert.equal(vibe.recentlyVibrated('0', now), false)
  assert.equal(vibe.recentlyVibrated(undefined, now), false)
  assert.equal(vibe.recentlyVibrated(now + 5000, now), false)    // часы переведены назад — не считаем
})

t('вибрация: тест-режим (10 с между событиями) не подавляется меткой', () => {
  assert.equal(vibe.recentlyVibrated(1, 1 + 10000), false)
  assert.ok(vibe.VIB_DEDUPE < 10000)
})

t('вибрация: настройки с телефона проверяются, по умолчанию серия STRONG_REMINDER и обрыв 2000 мс', () => {
  assert.deepEqual(vibe.cleanVibCfg(null), { vb: 0, vt: 2000 })
  assert.deepEqual(vibe.cleanVibCfg({}), { vb: 0, vt: 2000 })            // старое приложение на телефоне: полей нет
  assert.deepEqual(vibe.cleanVibCfg({ h: 514, hide: 1 }), { vb: 0, vt: 2000 })
  assert.deepEqual(vibe.cleanVibCfg({ vb: 1, vt: 1500 }), { vb: 1, vt: 1500 })
  assert.deepEqual(vibe.cleanVibCfg({ vb: 5, vt: 0 }), { vb: 5, vt: 0 })
  assert.deepEqual(vibe.cleanVibCfg({ vb: 9, vt: 50 }), { vb: 0, vt: 2000 })   // мусор -> по умолчанию
  assert.deepEqual(vibe.cleanVibCfg({ vb: 2, vt: 99999 }), { vb: 2, vt: 2000 })
  assert.deepEqual(vibe.cleanVibCfg({ vb: '3', vt: '700' }), { vb: 3, vt: 700 })
})

t('вибрация: время обрыва; повторяющиеся сцены (TIMER, CALL) никогда не вибрируют бесконечно', () => {
  assert.equal(vibe.stopAfter({ vb: 0, vt: 2500 }), 2500)
  assert.equal(vibe.stopAfter({ vb: 1, vt: 0 }), 0)               // кончится сама
  assert.equal(vibe.stopAfter({ vb: 4, vt: 0 }), vibe.VIB_MS_DEFAULT)
  assert.equal(vibe.stopAfter({ vb: 5, vt: 0 }), vibe.VIB_MS_DEFAULT)
  assert.equal(vibe.isRepeating(4), true)
  assert.equal(vibe.isRepeating(5), true)
  assert.equal(vibe.isRepeating(0), false)
  assert.ok(vibe.VIB_MS_MAX < 10000)                                // не перекрывает следующее событие тест-режима (10 с)
})

console.log('\nВсе проверки раскладки и вибрации пройдены: ' + n)
