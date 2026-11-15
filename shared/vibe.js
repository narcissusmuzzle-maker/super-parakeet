/**
 * Вибрация в конце промежутка и цветных таймеров. Вариант вибрации и время обрыва задаются на телефоне
 * (LuvU613 -> ⚙️ -> «Вид на часах», поля v.vb и v.vt в ответе на сообщения часов) и ОДИНАКОВЫ везде:
 * и при включённом экране (вибрирует страница), и при погасшем (вибрирует служба будильника).
 *
 * Варианты (номер vb — тот же, что в приложении на телефоне):
 *   0 STRONG_REMINDER — серия коротких, по документации 4 импульса за 1200 мс (по умолчанию, как было в v10)
 *   1 DURATION_LONG   — одна сильная, 1000 мс
 *   2 DURATION        — одна сильная, 600 мс
 *   3 NOTIFICATION    — два коротких, как у уведомления
 *   4 TIMER           — как у будильника, ПОВТОРЯЕТСЯ, пока не остановить
 *   5 CALL            — как у звонка, ПОВТОРЯЕТСЯ, пока не остановить
 * Время обрыва vt (мс): через сколько остановить вибрацию. 0 — не обрывать (только для вариантов, которые кончаются сами;
 * для повторяющихся 4 и 5 при 0 берётся 2000 мс, чтобы не вибрировало бесконечно).
 *
 * Страница и служба пишут в память метку «когда вибрировали» (ключ 'vibT'). Кто пришёл вторым и увидел свежую метку —
 * молчит: иначе при включённом экране сработали бы оба, а при погасшем — служба и потом страница, открытая будильником.
 */
export const VIB_DEDUPE = 6000     // метка 'vibT' моложе этого (мс) — вибрация уже была
export const VIB_KEY = 'vibT'
export const VIB_CFG_KEY = 'vv'    // сохранённые настройки вибрации { vb, vt }
export const VIB_VARIANTS = 6
export const VIB_MS_DEFAULT = 2000
export const VIB_MS_MIN = 200
export const VIB_MS_MAX = 8000

/** Вибрировали ли только что (last — метка из памяти, now — сейчас). */
export function recentlyVibrated(last, now) {
  const l = +last || 0
  return l > 0 && now - l >= 0 && now - l < VIB_DEDUPE
}

/** Настройки вибрации с телефона { vb, vt } -> проверенные значения (по умолчанию: серия STRONG_REMINDER, обрыв 2000 мс). */
export function cleanVibCfg(v) {
  if (!v) return { vb: 0, vt: VIB_MS_DEFAULT }
  let vb = Math.round(+v.vb)
  if (!(vb >= 0 && vb < VIB_VARIANTS)) vb = 0
  let vt = Math.round(+v.vt)
  if (!(vt === 0 || (vt >= VIB_MS_MIN && vt <= VIB_MS_MAX))) vt = VIB_MS_DEFAULT   // NaN тоже сюда
  return { vb: vb, vt: vt }
}

/** Повторяется ли сцена, пока её не остановят (TIMER, CALL). */
export function isRepeating(vb) { return vb === 4 || vb === 5 }

/** Через сколько мс остановить вибрацию; 0 — не останавливать (сцена кончится сама). */
export function stopAfter(cfg) {
  if (cfg.vt > 0) return cfg.vt
  return isRepeating(cfg.vb) ? VIB_MS_DEFAULT : 0
}
