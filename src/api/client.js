import axios from 'axios'

/**
 * 板端 API Base：生产环境可置空（与网页同源）；本地开发配合 Vite proxy 也建议置空。
 * 跨机调试时设置 VITE_BOARD_API_BASE=http://192.168.x.x:port
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_BOARD_API_BASE
  if (raw === undefined || raw === null || String(raw).trim() === '') return ''
  return String(raw).replace(/\/$/, '')
}

export const client = axios.create({
  baseURL: getApiBase(),
  timeout: Number(import.meta.env.VITE_BOARD_API_TIMEOUT ?? 15000),
  headers: {
    'Content-Type': 'application/json',
  },
})
