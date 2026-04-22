/** 统一从 axios 错误对象取可读文案 */
export function getErrorMessage(err, fallback = '请求失败') {
  const d = err?.response?.data
  if (typeof d === 'string' && d.trim()) return d
  if (d && typeof d === 'object') {
    if (d.message) return String(d.message)
    if (d.msg) return String(d.msg)
    if (d.error) return String(d.error)
  }
  if (err?.code === 'ECONNABORTED') return '请求超时，请检查网络或板端负载'
  if (err?.message === 'Network Error') return '网络异常，无法连接板端'
  if (err?.message) return String(err.message)
  return fallback
}
