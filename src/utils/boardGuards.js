/**
 * 防止本机其它 HTTP 服务（误占端口、返回 200 + 空 JSON 等）被当成门禁板在线。
 * 若你的固件 health/state 形态特殊，可设 VITE_RELAX_STATE=1 或调整下方判断。
 */
const STRICT_HEALTH_OK =
  import.meta.env.VITE_STRICT_HEALTH === '1' || import.meta.env.VITE_STRICT_HEALTH === 'true'

const RELAX_EMPTY_STATE =
  import.meta.env.VITE_RELAX_STATE === '1' || import.meta.env.VITE_RELAX_STATE === 'true'

const MISMATCH =
  '未识别为门禁设备响应（请确认已连接板端，且 Vite 代理 / Base URL 指向正确端口）'

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

export function assertHealthPayload(h) {
  if (!isPlainObject(h)) {
    throw new Error(MISMATCH)
  }
  if (Object.keys(h).length === 0) {
    throw new Error(MISMATCH)
  }
  if (STRICT_HEALTH_OK && h.ok !== true) {
    throw new Error('健康检查要求 health.ok === true（当前为严格模式 VITE_STRICT_HEALTH）')
  }
}

export function assertStatePayload(s) {
  if (!isPlainObject(s)) {
    throw new Error(MISMATCH)
  }
  if (!RELAX_EMPTY_STATE && Object.keys(s).length === 0) {
    throw new Error(MISMATCH)
  }
}

export function assertBoardHealthAndState(healthData, stateData) {
  assertHealthPayload(healthData)
  assertStatePayload(stateData)
}
