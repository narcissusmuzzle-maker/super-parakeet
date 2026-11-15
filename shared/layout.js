/**
 * Раскладка экрана (чистые функции, без обращений к API часов — проверяются тестами в Node).
 *
 * Рабочая область — прямоугольник 0..H по высоте. Если системная полоска сверху скрыта (setStatusBarVisible(false)),
 * H = весь экран, 514 px. Если полоска есть, система сжимает страницу до 450 px (514 - 64). Свою высоту можно задать
 * на телефоне: LuvU613 -> ⚙️ -> «Вид на часах» (приходит в ответе на «sync», поле v.h).
 */
export const FULL_H = 514
export const MIN_H = 300
export const MAX_H = 600

/** Высота рабочей области: целое от MIN_H до MAX_H, иначе весь экран. */
export function cleanH(h) {
  const n = Math.round(+h)
  return n >= MIN_H && n <= MAX_H ? n : FULL_H
}

/** Высота одной из трёх равных строк экрана (очередь / верхний ряд / нижний ряд). */
export function rowH(h) { return Math.floor(h / 3) }

/** x левого значка очереди: n значков с шагом step и размером size стоят по центру cx. */
export function queueX0(n, cx, size, step) {
  const k = n > 0 ? n : 1
  return Math.round(cx - ((k - 1) * step + size) / 2)
}

/** Верх блока высотой block, стоящего по вертикали по центру области высотой h (не выше нуля). */
export function centerTop(h, block) { return Math.max(0, Math.round((h - block) / 2)) }

/** Настройки вида с телефона: { h, hide } -> проверенные значения (hide — скрыть системную полоску). */
export function cleanView(v) {
  return { h: cleanH(v && v.h), hide: !v || v.hide === undefined ? 1 : (v.hide ? 1 : 0) }
}
