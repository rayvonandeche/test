import { useEffect, useState } from 'react'
import VendorNav from '../../components/VendorNav.jsx'
import { getProfile, updateProfile } from '../../services/vendorService.js'

const CONTACT_PREFERENCES = ['message', 'email', 'phone']

export default function VendorProfilePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contactPreference, setContactPreference] = useState('message')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setName(profile.name || '')
        setDescription(profile.description || '')
        setContactPreference(profile.contactPreference || 'message')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await updateProfile({ name, description, contactPreference })
      setMessage('Profile saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-page">
      <h1>SU FLEA MARKET</h1>
      <h2>My Profile</h2>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <form className="form-card" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you sell?"
          />

          <label htmlFor="contactPreference">Contact Preference</label>
          <select
            id="contactPreference"
            value={contactPreference}
            onChange={(e) => setContactPreference(e.target.value)}
          >
            {CONTACT_PREFERENCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-dark" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      <VendorNav />
    </div>
  )
}
