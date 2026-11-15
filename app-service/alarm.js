// Служба «будильник»: её запускает система в момент окончания таймера, даже если экран погашен и приложение закрыто.
//  - вибрирует тем вариантом, который выбран на телефоне (LuvU613 -> ⚙️ -> «Вид на часах»; страница сохранила его в памяти, ключ 'vv');
//    по умолчанию — серия STRONG_REMINDER (см. shared/vibe.js). Время обрыва здесь НЕ применяется: вибрацию при погасшем экране
//    заканчивает сама система вместе со службой (как в версиях 10–14); свой таймер и stop() здесь не нужны (в v15 они сделали вибрацию длиннее);
//  - для часового таймера сама ставит следующий будильник через час (в тесте — через 10 секунд),
//    чтобы вибрация повторялась на каждом обнулении, пока вы не нажмёте стоп или другой таймер;
//  - если приложение с тех пор поставило новые будильники (номер поколения не совпал), служба молча выходит;
//  - если страница только что сама вибрировала (экран был включён), служба молчит — иначе вибрация была бы двойной.
// Служба живёт недолго (сколько — решает система), поэтому ничего тяжёлого здесь нет.
// Параметр: вид|поколение|период в секундах.
import { Vibrator } from '@zos/sensor'
import { LocalStorage } from '@zos/storage'
import { set as alarmSet } from '@zos/alarm'
import { VIB_KEY, VIB_CFG_KEY, recentlyVibrated, cleanVibCfg } from '../shared/vibe'
import { sceneOf } from '../shared/vibscene'

AppService({
  onInit(param) {
    const parts = String(param || '').split('|')   // вид|поколение|период в секундах
    const kind = parts[0]
    const gen = parts[1]
    const every = +parts[2] || 0
    const now = Date.now()

    let ls = null
    let canCheck = false
    try {
      ls = new LocalStorage()
      canCheck = true
      if (String(ls.getItem('gen', '')) !== String(gen)) return   // устаревший будильник
    } catch (e) { /* проверить нельзя — вибрируем, но цепочку не продолжаем */ }

    let quiet = false
    let cfg = cleanVibCfg(null)
    if (ls) {
      try { quiet = recentlyVibrated(ls.getItem(VIB_KEY, '0'), now) } catch (e) { /* не критично */ }
      try {
        const raw = ls.getItem(VIB_CFG_KEY, '')
        if (raw) cfg = cleanVibCfg(JSON.parse(raw))
      } catch (e) { /* настройки по умолчанию */ }
    }

    if (!quiet) {
      try {
        const v = new Vibrator()
        v.start({ mode: sceneOf(cfg.vb) })
      } catch (e) { /* вибрация не вышла */ }
      if (ls) { try { ls.setItem(VIB_KEY, String(now)) } catch (e) { /* не критично */ } }
    }

    if (kind === 'hour' && canCheck && every > 0) {
      try { alarmSet({ url: 'app-service/alarm', param: kind + '|' + gen + '|' + every, delay: every }) } catch (e) { /* без повтора */ }
    }
  },
  onDestroy() {}
})
