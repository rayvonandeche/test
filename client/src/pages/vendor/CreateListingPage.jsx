import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from 'su-flea-market-shared'
import VendorNav from '../../components/VendorNav.jsx'
import { createListing, uploadListingImage } from '../../services/vendorService.js'
import { getActiveEvents } from '../../services/eventService.js'

const MAX_IMAGES = 5

export default function CreateListingPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [eventId, setEventId] = useState('')
  const [description, setDescription] = useState('')
  const [events, setEvents] = useState([])

  // Queued locally and uploaded right after the listing is created —
  // the images endpoint needs a listingId, which doesn't exist yet.
  const [pendingImages, setPendingImages] = useState([])

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getActiveEvents()
      .then((active) => {
        setEvents(active)
        if (active.length > 0) setEventId(active[0].id)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    // Free object URLs when the page unmounts.
    return () => pendingImages.forEach((img) => URL.revokeObjectURL(img.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    if (pendingImages.length >= MAX_IMAGES) {
      setError('Maximum 5 images per listing')
      return
    }
    setError('')
    setPendingImages((prev) => [...prev, { file, preview: URL.createObjectURL(file) }])
  }

  function removePendingImage(index) {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { listingId } = await createListing({
        title,
        description,
        category,
        price: Number(price),
        eventId
      })

      let failed = 0
      for (const img of pendingImages) {
        try {
          await uploadListingImage(listingId, img.file)
        } catch {
          failed += 1
        }
      }

      const message =
        failed > 0
          ? `Listing submitted for review — ${failed} image(s) failed to upload, add them from Edit`
          : 'Listing submitted for review'
      navigate('/vendor/dashboard', { state: { message } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="app-page">
      <h1>SU FLEA MARKET</h1>
      <button type="button" className="back-link" onClick={() => navigate('/vendor/dashboard')}>
        ‹ Back to dashboard
      </button>
      <h2>Create Listing</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Handmade Bag"
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
          placeholder="e.g. 800"
          required
        />

        <label htmlFor="event">Event Period</label>
        <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
          {events.length === 0 && <option value="">No active events</option>}
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
          placeholder="Describe your product"
          required
        />

        <label>Images ({pendingImages.length}/{MAX_IMAGES})</label>
        <div className="image-slots">
          {pendingImages.map((img, i) => (
            <div key={img.preview} className="image-slot filled">
              <img src={img.preview} alt={`Upload ${i + 1}`} />
              <button
                type="button"
                className="image-remove"
                aria-label="Remove image"
                onClick={() => removePendingImage(i)}
              >
                ×
              </button>
            </div>
          ))}
          {pendingImages.length < MAX_IMAGES && (
            <button
              type="button"
              className="image-slot empty"
              onClick={() => fileInputRef.current?.click()}
            >
              +
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

        <button type="submit" className="btn btn-dark" disabled={submitting || !eventId}>
          {submitting ? 'Submitting…' : 'Submit for Review'}
        </button>
      </form>

      <VendorNav />
    </div>
  )
}
