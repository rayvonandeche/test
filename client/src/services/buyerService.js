import axios from 'axios'
import { auth } from '../config/firebase.js'
export { getEvents } from './eventService.js'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`
})

// Normalise axios errors to the server's { error } message.
function apiError(err) {
  return new Error(err.response?.data?.error || err.message || 'Something went wrong')
}

async function authHeaders() {
  const idToken = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${idToken}` }
}

/**
 * GET /api/listings — buyer feed.
 * params: { search, category, eventId, minPrice, maxPrice, page, pageSize }
 * Empty values are dropped before the request.
 */
export async function getListings(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  )
  try {
    const { data } = await api.get('/listings', {
      headers: await authHeaders(),
      params: clean
    })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

/** GET /api/listings/:id — listing detail + images + vendor info. */
export async function getListing(id) {
  try {
    const { data } = await api.get(`/listings/${id}`, { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

/** POST /api/buyer/reports — { listingId, reason }. */
export async function submitReport({ listingId, reason }) {
  try {
    const { data } = await api.post(
      '/buyer/reports',
      { listingId, reason },
      { headers: await authHeaders() }
    )
    return data
  } catch (err) {
    throw apiError(err)
  }
}

/** GET /api/buyer/vendors/:vendorId — public vendor profile + listings. */
export async function getVendorProfile(vendorId) {
  try {
    const { data } = await api.get(`/buyer/vendors/${vendorId}`, {
      headers: await authHeaders()
    })
    return data
  } catch (err) {
    throw apiError(err)
  }
}
