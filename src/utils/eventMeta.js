/** 事件类型 → Element Plus Tag 类型与中文标签（可按板端 type 扩展） */
const MAP = {
  recognized: { type: 'success', label: '识别成功' },
  stranger: { type: 'warning', label: '陌生人' },
  liveness_fail: { type: 'danger', label: '活体失败' },
  register_success: { type: 'success', label: '注册成功' },
  register_fail: { type: 'danger', label: '注册失败' },
  unlock_done: { type: 'info', label: '开锁' },
  unlock: { type: 'info', label: '开锁' },
  alarm: { type: 'danger', label: '告警' },
  alarm_test: { type: 'warning', label: '报警测试' },
  door: { type: 'info', label: '门禁' },
  system: { type: 'info', label: '系统' },
  unknown: { type: 'info', label: '事件' },
}

export function eventTagMeta(kind) {
  const k = String(kind || 'unknown').toLowerCase()
  return MAP[k] ?? { type: 'info', label: k || '事件' }
}

export function formatTs(ts) {
  if (ts == null) return '—'
  const n = typeof ts === 'number' ? ts : Date.parse(ts)
  if (Number.isNaN(n)) return String(ts)
  const d = new Date(n)
  return d.toLocaleString()
}
