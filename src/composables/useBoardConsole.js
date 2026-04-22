import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import * as boardApi from '@/api/board'
import { getErrorMessage } from '@/utils/httpError'
import { assertBoardHealthAndState } from '@/utils/boardGuards'

const POLL_MS = Number(import.meta.env.VITE_BOARD_POLL_MS ?? 2000)

const online = ref(false)
const sseConnected = ref(false)
const pollActive = ref(false)
const bannerMessage = ref('')
const health = ref(null)
const deviceState = ref(null)
const events = ref([])
const faces = ref([])

const bootstrapping = ref(false)
const refreshing = ref(false)

let pollTimer = null
let es = null

/** 不记入时间线的 SSE/轮询噪声类型（非业务事件） */
function shouldIgnoreEventKind(kind) {
  const t = String(kind ?? '').toLowerCase()
  return ['heartbeat', 'ping', 'pong', 'keepalive', 'noop'].includes(t)
}

function clearBoardData() {
  health.value = null
  deviceState.value = null
  events.value = []
  faces.value = []
}

function normalizeEvent(raw) {
  const type = raw?.type ?? raw?.event ?? raw?.kind ?? 'unknown'
  return {
    id:
      raw?.id ??
      `${type}-${raw?.ts ?? raw?.time ?? Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    ts: raw?.ts ?? raw?.time ?? Date.now(),
    message: raw?.message ?? raw?.msg ?? raw?.detail ?? '',
    name: raw?.name,
    face_id: raw?.face_id,
    raw,
  }
}

function normalizeEventsPayload(data) {
  const list = Array.isArray(data) ? data : data?.events ?? data?.items ?? data?.data ?? []
  return list
    .map((x) => normalizeEvent(typeof x === 'object' ? x : { message: String(x) }))
    .filter((e) => !shouldIgnoreEventKind(e.type))
}

function normalizeFacesPayload(data) {
  return Array.isArray(data) ? data : data?.faces ?? data?.items ?? data?.data ?? []
}

function prependEvents(items) {
  const merged = items.filter((e) => !shouldIgnoreEventKind(e.type))
  if (!merged.length) return
  const next = [...merged, ...events.value]
  const seen = new Set()
  events.value = next.filter((e) => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  }).slice(0, 500)
}

function applySseData(payload) {
  if (!payload || typeof payload !== 'object') return
  if (payload.state && typeof payload.state === 'object') {
    deviceState.value = { ...(deviceState.value ?? {}), ...payload.state }
  }
  if (payload.device_state && typeof payload.device_state === 'object') {
    deviceState.value = { ...(deviceState.value ?? {}), ...payload.device_state }
  }
  const ev = payload.event ?? payload
  if (ev && (ev.type || ev.event)) {
    const kind = ev.type ?? ev.event
    if (shouldIgnoreEventKind(kind)) return
    prependEvents([normalizeEvent(ev)])
  }
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  pollActive.value = false
}

function closeEs() {
  try {
    es?.close()
  } catch {
    /* ignore */
  }
  es = null
  sseConnected.value = false
}

function showErr(err, fallback) {
  ElMessage.error(getErrorMessage(err, fallback))
}

async function pingOnline() {
  try {
    const [h, s] = await Promise.all([boardApi.getHealth(), boardApi.getState()])
    assertBoardHealthAndState(h, s)
    health.value = h
    deviceState.value = s
    online.value = true
    bannerMessage.value = ''
    return true
  } catch (err) {
    online.value = false
    bannerMessage.value = getErrorMessage(err, '设备离线或无法访问')
    clearBoardData()
    return false
  }
}

async function pollTick() {
  try {
    const [h, s, ev] = await Promise.all([
      boardApi.getHealth(),
      boardApi.getState(),
      boardApi.getEvents(80),
    ])
    assertBoardHealthAndState(h, s)
    health.value = h
    deviceState.value = s
    events.value = normalizeEventsPayload(ev)
    online.value = true
    bannerMessage.value = ''
  } catch (err) {
    online.value = false
    bannerMessage.value = getErrorMessage(err, '轮询失败，连接可能已断开')
    clearBoardData()
  }
}

function startPoll() {
  stopPoll()
  pollActive.value = true
  pollTimer = setInterval(pollTick, POLL_MS)
}

const SSE_EVENT_NAMES = [
  'recognized',
  'stranger',
  'liveness_fail',
  'register_success',
  'register_fail',
  'unlock_done',
  'unlock',
  'alarm',
  'alarm_test',
  'message',
]

function attachNamedSseListeners(source) {
  for (const name of SSE_EVENT_NAMES) {
    source.addEventListener(name, (e) => {
      try {
        const data = e.data ? JSON.parse(e.data) : {}
        const kind = data.type ?? name
        if (shouldIgnoreEventKind(kind)) return
        applySseData({ event: { ...data, type: kind } })
      } catch {
        if (!shouldIgnoreEventKind(name)) {
          applySseData({ event: { type: name, message: e.data } })
        }
      }
    })
  }
}

function trySse() {
  closeEs()
  stopPoll()
  const url = boardApi.streamUrl()
  try {
    es = new EventSource(url)
  } catch {
    startPoll()
    pollTick()
    return
  }

  es.onopen = () => {
    sseConnected.value = true
    pollActive.value = false
    stopPoll()
  }

  es.onerror = () => {
    closeEs()
    if (!pollActive.value) {
      startPoll()
      pollTick()
    }
  }

  es.onmessage = (e) => {
    if (!e.data) return
    const raw = String(e.data).trim()
    if (raw.startsWith(':')) return
    try {
      const payload = JSON.parse(e.data)
      if (shouldIgnoreEventKind(payload.type)) {
        if (payload.state && typeof payload.state === 'object') {
          deviceState.value = { ...(deviceState.value ?? {}), ...payload.state }
        }
        return
      }
      applySseData(payload)
    } catch {
      if (raw) applySseData({ event: { type: 'message', message: e.data } })
    }
  }

  attachNamedSseListeners(es)
}

const registeredCount = computed(() => {
  const s = deviceState.value
  if (s && typeof s.registered_count === 'number') return s.registered_count
  if (s && typeof s.face_count === 'number') return s.face_count
  return faces.value.length
})

const boardIp = computed(() => {
  const s = deviceState.value
  return s?.ip ?? s?.board_ip ?? s?.wlan_ip ?? s?.wifi_ip ?? '—'
})

const wifiOk = computed(() => {
  const s = deviceState.value
  if (s?.wifi_connected != null) return !!s.wifi_connected
  if (s?.wifi_ok != null) return !!s.wifi_ok
  if (s?.wlan_connected != null) return !!s.wlan_connected
  return undefined
})

const doorLocked = computed(() => {
  const s = deviceState.value
  if (s?.door_locked != null) return !!s.door_locked
  if (s?.lock_state != null) return String(s.lock_state).toLowerCase() === 'locked'
  return undefined
})

const lastRecognition = computed(() => events.value.find((e) => e.type === 'recognized'))
const lastAlarm = computed(() =>
  events.value.find((e) => e.type === 'alarm' || e.type === 'alarm_test' || e.type === 'stranger'),
)

function createBoardConsole() {
  async function bootstrap() {
    bootstrapping.value = true
    bannerMessage.value = ''
    try {
      const [h, s, ev, f] = await Promise.all([
        boardApi.getHealth(),
        boardApi.getState(),
        boardApi.getEvents(50),
        boardApi.getFaces(),
      ])
      assertBoardHealthAndState(h, s)
      health.value = h
      deviceState.value = s
      events.value = normalizeEventsPayload(ev)
      faces.value = normalizeFacesPayload(f)
      online.value = true
    } catch (err) {
      online.value = false
      bannerMessage.value = getErrorMessage(err, '无法连接板端')
      clearBoardData()
      showErr(err, '初始化数据失败')
    } finally {
      bootstrapping.value = false
    }
  }

  async function refreshSoft() {
    if (!online.value) {
      const ok = await pingOnline()
      if (!ok) return
    }
    refreshing.value = true
    try {
      const [h, s, ev, f] = await Promise.all([
        boardApi.getHealth(),
        boardApi.getState(),
        boardApi.getEvents(80),
        boardApi.getFaces(),
      ])
      assertBoardHealthAndState(h, s)
      health.value = h
      deviceState.value = s
      events.value = normalizeEventsPayload(ev)
      faces.value = normalizeFacesPayload(f)
    } catch (err) {
      online.value = false
      bannerMessage.value = getErrorMessage(err, '刷新失败')
      clearBoardData()
      showErr(err, '刷新失败')
    } finally {
      refreshing.value = false
    }
  }

  async function refreshFaces() {
    try {
      faces.value = normalizeFacesPayload(await boardApi.getFaces())
    } catch (err) {
      showErr(err, '获取人脸列表失败')
    }
  }

  async function refreshEventsLimit(limit) {
    try {
      events.value = normalizeEventsPayload(await boardApi.getEvents(limit))
    } catch (err) {
      showErr(err, '获取事件失败')
    }
  }

  function startRealtime() {
    closeEs()
    stopPoll()
    trySse()
  }

  function stopRealtime() {
    closeEs()
    stopPoll()
  }

  async function registerFace(name) {
    await boardApi.postRegister({ name })
    ElMessage.success('注册流程已启动，请面向摄像头完成采集')
  }

  async function deleteFace(body) {
    await boardApi.postFaceDelete(body)
    ElMessage.success('已提交删除请求')
    await refreshFaces()
  }

  async function resetFaces() {
    await boardApi.postFacesReset()
    ElMessage.success('已提交清空人脸库请求')
    await refreshFaces()
  }

  async function unlockDoor(durationMs) {
    const data = await boardApi.postDoorUnlock({ duration_ms: durationMs })
    ElMessage.success('开锁指令已下发')
    return data
  }

  async function testAlarm() {
    const data = await boardApi.postAlarmTest()
    ElMessage.success('报警测试已触发')
    return data
  }

  return reactive({
    online,
    sseConnected,
    pollActive,
    bannerMessage,
    health,
    deviceState,
    events,
    faces,
    bootstrapping,
    refreshing,
    registeredCount,
    boardIp,
    wifiOk,
    doorLocked,
    lastRecognition,
    lastAlarm,
    bootstrap,
    refreshSoft,
    refreshFaces,
    refreshEventsLimit,
    startRealtime,
    stopRealtime,
    registerFace,
    deleteFace,
    resetFaces,
    unlockDoor,
    testAlarm,
    showErr,
    getErrorMessage,
  })
}

/** 单板控制台：模块级单例，保证各页面共享同一连接状态 */
let _singleton
export function useBoardConsole() {
  if (!_singleton) _singleton = createBoardConsole()
  return _singleton
}
