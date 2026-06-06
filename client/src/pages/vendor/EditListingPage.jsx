import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES } from 'su-flea-market-shared'
import VendorNav from '../../components/VendorNav.jsx'
import {
  getListing,
  updateListing,
  uploadListingImage,
  deleteListingImage
} from '../../services/vendorService.js'
import { getActiveEvents } from '../../services/eventService.js'

const MAX_IMAGES = 5

export default function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [eventId, setEventId] = useState('')
  const [description, setDescription] = useState('')
  const [moderationStatus, setModerationStatus] = useState('')
  const [images, setImages] = useState([])
  const [events, setEvents] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)

  useEffect(() => {
    Promise.all([getListing(id), getActiveEvents()])
      .then(([listing, active]) => {
        setTitle(listing.title)
        setCategory(listing.category)
        setPrice(String(listing.price))
        setDescription(listing.description)
        setModerationStatus(listing.moderationStatus)
        setImages(listing.images || [])

        // Keep the listing's own event selectable even if it has closed.
        const eventOptions = active.some((ev) => ev.id === listing.eventId)
          ? active
          : [{ id: listing.eventId, name: 'Current event (closed)' }, ...active]
        setEvents(eventOptions)
        setEventId(listing.eventId)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (images.length >= MAX_IMAGES) {
      setError('Maximum 5 images per listing')
      return
    }
    setError('')
    setImageBusy(true)
    try {
      const { imageId, url } = await uploadListingImage(id, file)
      setImages((prev) => [...prev, { id: imageId, url }])
    } catch (err) {
      setError(err.message)
    } finally {
      setImageBusy(false)
    }
  }

  async function handleDeleteImage(imageId) {
    setError('')
    setImageBusy(true)
    try {
      await deleteListingImage(id, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      setError(err.message)
    } finally {
      setImageBusy(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await updateListing(id, {
        title,
        description,
        category,
        price: Number(price),
        eventId
      })
      navigate('/vendor/dashboard', { state: { message: 'Changes saved' } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="app-page">
        <h1>SU FLEA MARKET</h1>
        <p>Loading…</p>
        <VendorNav />
      </div>
    )
  }

  return (
    <div className="app-page">
      <h1>SU FLEA MARKET</h1>
      <button type="button" className="back-link" onClick={() => navigate('/vendor/dashboard')}>
        ‹ Back to dashboard
      </button>
      <h2>Edit Listing</h2>

      {moderationStatus === 'approved' && (
        <p className="notice">Editing an approved listing resets it to pending review</p>
      )}
      {moderationStatus === 'rejected' && (
        <p className="notice">Saving changes will resubmit this listing for review</p>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label htmlFor="price">Price (KSh)</label>
        <input
          id="price"
          type="number"
          min="1"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label htmlFor="event">Event Period</label>
        <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Images ({images.length}/{MAX_IMAGES})</label>
        <div className="image-slots">
          {images.map((img) => (
            <div key={img.id} className="image-slot filled">
              <img src={img.url} alt={title} />
              <button
                type="button"
                className="image-remove"
                aria-label="Remove image"
                disabled={imageBusy}
                onClick={() => handleDeleteImage(img.id)}
              >
                ×
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              className="image-slot empty"
              disabled={imageBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageBusy ? '…' : '+'}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelected}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn-dark" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <VendorNav />
    </div>
  )
}
