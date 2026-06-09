import { db } from '../config/firebase.js'
import serialize from '../utils/serialize.js'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50

/** Statuses a buyer may see on the detail page. The feed is active-only,
 *  but sold listings stay viewable with a SOLD indicator (proposal TC17). */
const DETAIL_VISIBLE_STATUSES = ['active', 'sold']

async function firstImageOf(docRef) {
  const snap = await docRef.collection('images').orderBy('order').limit(1).get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  return { id: doc.id, ...serialize(doc.data()) }
}

/**
 * GET /api/listings
 * Buyer-facing feed: active + approved only.
 * Filters (?search, ?category, ?eventId, ?minPrice, ?maxPrice) and
 * pagination (?page, ?pageSize) are applied in memory — keeps Firestore
 * free of composite indexes and gives an exact total count.
 */
export async function browseListings(req, res) {
  const { search, category, eventId, minPrice, maxPrice } = req.query

  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE)
  )

  const snap = await db
    .collection('listings')
    .where('listingStatus', '==', 'active')
    .where('moderationStatus', '==', 'approved')
    .get()

  let listings = snap.docs.map((doc) => ({ id: doc.id, ref: doc.ref, ...serialize(doc.data()) }))

  if (search) {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean)
    // Prefix match both ways so "bags" finds "bag" and "hand" finds "handmade".
    listings = listings.filter((l) =>
      words.some((w) =>
        (l.searchKeywords || []).some((k) => k.startsWith(w) || w.startsWith(k))
      )
    )
  }
  if (category) {
    listings = listings.filter((l) => l.category === category)
  }
  if (eventId) {
    listings = listings.filter((l) => l.eventId === eventId)
  }
  const min = Number(minPrice)
  if (Number.isFinite(min)) {
    listings = listings.filter((l) => l.price >= min)
  }
  const max = Number(maxPrice)
  if (Number.isFinite(max)) {
    listings = listings.filter((l) => l.price <= max)
  }

  listings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  const total = listings.length
  const pageItems = listings.slice((page - 1) * pageSize, page * pageSize)

  const withImages = await Promise.all(
    pageItems.map(async ({ ref, ...listing }) => ({
      ...listing,
      firstImage: await firstImageOf(ref)
    }))
  )

  return res.json({ listings: withImages, total, page, pageSize })
}

/**
 * GET /api/listings/:id
 * Full listing + images + vendor public info (name/description only).
 * 404 unless approved and active/sold.
 */
export async function getListingDetail(req, res) {
  const snap = await db.collection('listings').doc(req.params.id).get()

  if (!snap.exists) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  const listing = snap.data()
  const visible =
    listing.moderationStatus === 'approved' &&
    DETAIL_VISIBLE_STATUSES.includes(listing.listingStatus)
  if (!visible) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  const imagesSnap = await snap.ref.collection('images').orderBy('order').get()
  const images = imagesSnap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) }))

  let vendor = null
  const vendorSnap = await db.collection('users').doc(listing.vendorId).get()
  if (vendorSnap.exists) {
    const { name, description } = vendorSnap.data()
    vendor = { name, description }
  }

  return res.json({ id: snap.id, ...serialize(listing), images, vendor })
}
