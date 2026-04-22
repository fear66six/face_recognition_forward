import { client, getApiBase } from './client'

export function streamUrl() {
  const b = getApiBase()
  const path = '/api/stream'
  return b ? `${b}${path}` : path
}

export async function getHealth() {
  const { data } = await client.get('/api/health')
  return data
}

export async function getState() {
  const { data } = await client.get('/api/state')
  return data
}

export async function getEvents(limit = 50) {
  const { data } = await client.get('/api/events', { params: { limit } })
  return data
}

export async function getFaces() {
  const { data } = await client.get('/api/faces')
  return data
}

export async function postRegister(body) {
  const { data } = await client.post('/api/register', body)
  return data
}

export async function postFaceDelete(body) {
  const { data } = await client.post('/api/faces/delete', body)
  return data
}

export async function postFacesReset() {
  const { data } = await client.post('/api/faces/reset')
  return data
}

export async function postDoorUnlock(body) {
  const { data } = await client.post('/api/door/unlock', body)
  return data
}

export async function postAlarmTest() {
  const { data } = await client.post('/api/alarm/test')
  return data
}
