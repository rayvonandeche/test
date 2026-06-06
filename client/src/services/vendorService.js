import axios from 'axios'
import { auth } from '../config/firebase.js'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/vendor`
})

// Normalise axios errors to the server's { error } message.
function apiError(err) {
  return new Error(err.response?.data?.error || err.message || 'Something went wrong')
}

async function authHeaders() {
  const idToken = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${idToken}` }
}

export async function getProfile() {
  try {
    const { data } = await api.get('/profile', { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function updateProfile({ name, description, contactPreference }) {
  try {
    const { data } = await api.put(
      '/profile',
      { name, description, contactPreference },
      { headers: await authHeaders() }
    )
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function getMyListings() {
  try {
    const { data } = await api.get('/listings', { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function getListing(id) {
  try {
    const { data } = await api.get(`/listings/${id}`, { headers: await authHeaders() })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function createListing({ title, description, category, price, eventId }) {
  try {
    const { data } = await api.post(
      '/listings',
      { title, description, category, price, eventId },
      { headers: await authHeaders() }
    )
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function updateListing(id, { title, description, category, price, eventId }) {
  try {
    const { data } = await api.put(
      `/listings/${id}`,
      { title, description, category, price, eventId },
      { headers: await authHeaders() }
    )
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function deactivateListing(id) {
  try {
    const { data } = await api.put(`/listings/${id}/deactivate`, null, {
      headers: await authHeaders()
    })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function markListingSold(id) {
  try {
    const { data } = await api.put(`/listings/${id}/sold`, null, {
      headers: await authHeaders()
    })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function uploadListingImage(id, file) {
  const form = new FormData()
  form.append('image', file)
  try {
    const { data } = await api.post(`/listings/${id}/images`, form, {
      headers: await authHeaders()
    })
    return data
  } catch (err) {
    throw apiError(err)
  }
}

export async function deleteListingImage(id, imageId) {
  try {
    await api.delete(`/listings/${id}/images/${imageId}`, {
      headers: await authHeaders()
    })
  } catch (err) {
    throw apiError(err)
  }
}

export async function getUnreadInquiryCount() {
  try {
    const { data } = await api.get('/inquiries/unread-count', {
      headers: await authHeaders()
    })
    return data.unreadCount
  } catch (err) {
    throw apiError(err)
  }
}
