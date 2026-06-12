import axios from 'axios'
import { auth } from '../config/firebase.js'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/admin`
})

// Normalise axios errors to the server's { error } message.
function apiError(err) {
  return new Error(err.response?.data?.error || err.message || 'Something went wrong')
}

async function authHeaders() {
  const idToken = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${idToken}` }
}

async function get(path, params) {
  try {
    const { data } = await api.get(path, { headers: await authHeaders(), params })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

async function put(path, body = null) {
  try {
    const { data } = await api.put(path, body, { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

async function post(path, body) {
  try {
    const { data } = await api.post(path, body, { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

/* Dashboard */
export const getStats = () => get('/stats')

/* Listings */
export const getPendingListings = () => get('/listings/pending')
export const approveListing = (id) => put(`/listings/${id}/approve`)
export const rejectListing = (id, removalReason) =>
  put(`/listings/${id}/reject`, { removalReason })
export const removeListing = (id, removalReason) =>
  put(`/listings/${id}/remove`, { removalReason })

/* Vendors */
export const getVendors = () => get('/vendors')
export const suspendVendor = (vendorId, suspensionReason) =>
  put(`/vendors/${vendorId}/suspend`, { suspensionReason })

/* Events */
export const createEvent = ({ name, startDate, endDate }) =>
  post('/events', { name, startDate, endDate })
export const getAdminEvents = () => get('/events')
export const activateEvent = (id) => put(`/events/${id}/activate`)
export const closeEvent = (id) => put(`/events/${id}/close`)

/* Reports */
export const getReports = () => get('/reports')
export const dismissReport = (id) => put(`/reports/${id}/dismiss`)
export const removeListingForReport = (id, resolutionNote) =>
  put(`/reports/${id}/remove-listing`, { resolutionNote })
export const suspendVendorForReport = (id, { suspensionReason, resolutionNote }) =>
  put(`/reports/${id}/suspend-vendor`, { suspensionReason, resolutionNote })
