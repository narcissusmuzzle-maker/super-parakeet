/**
 * Номер варианта вибрации (shared/vibe.js) -> сцена вибромотора Zepp OS. Отдельный файл: здесь импорт из @zos/sensor,
 * а shared/vibe.js остаётся чистым и проверяется тестами в Node.
 */
import {
  VIBRATOR_SCENE_STRONG_REMINDER,
  VIBRATOR_SCENE_DURATION_LONG,
  VIBRATOR_SCENE_DURATION,
  VIBRATOR_SCENE_NOTIFICATION,
  VIBRATOR_SCENE_TIMER,
  VIBRATOR_SCENE_CALL
} from '@zos/sensor'

const LIST = [
  VIBRATOR_SCENE_STRONG_REMINDER,   // 0
  VIBRATOR_SCENE_DURATION_LONG,     // 1
  VIBRATOR_SCENE_DURATION,          // 2
  VIBRATOR_SCENE_NOTIFICATION,      // 3
  VIBRATOR_SCENE_TIMER,             // 4
  VIBRATOR_SCENE_CALL               // 5
]

/** Сцена по номеру варианта; если такой сцены на часах нет — STRONG_REMINDER. */
export function sceneOf(vb) {
  const s = LIST[vb]
  return s === undefined ? VIBRATOR_SCENE_STRONG_REMINDER : s
}
