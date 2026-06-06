import axios from 'axios'
import { auth } from '../config/firebase.js'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/events`
})

function apiError(err) {
  return new Error(err.response?.data?.error || err.message || 'Something went wrong')
}

async function authHeaders() {
  const idToken = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${idToken}` }
}

/** Active events for the listing form's "Event Period" dropdown. */
export async function getActiveEvents() {
  try {
    const { data } = await api.get('/', {
      headers: await authHeaders(),
      params: { status: 'active' }
    })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

/** All events (any status) — the buyer filter's Event Period dropdown. */
export async function getEvents() {
  try {
    const { data } = await api.get('/', { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}
