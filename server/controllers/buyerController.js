import { db } from '../config/firebase.js'
import serialize from '../utils/serialize.js'

/**
 * POST /api/buyer/reports — body: { listingId, reason }
 * Buyer role only. Creates an open report for admin review.
 */
export async function createReport(req, res) {
  const { listingId, reason } = req.body || {}

  if (!listingId) {
    return res.status(400).json({ error: 'listingId is required' })
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Reason is required' })
  }

  const listingSnap = await db.collection('listings').doc(listingId).get()
  if (!listingSnap.exists) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  const report = {
    listingId,
    reporterId: req.user.uid,
    reason: reason.trim(),
    status: 'open',
    createdAt: new Date(),
    reviewedBy: null,
    reviewedAt: null,
    adminAction: null,
    resolutionNote: null
  }

  const ref = await db.collection('reports').add(report)
  return res.status(201).json({ reportId: ref.id })
}

/**
 * GET /api/buyer/vendors/:vendorId
 * Public vendor profile: name + description only, plus their
 * visible (active + approved) listings with first images.
 */
export async function getVendorPublicProfile(req, res) {
  const vendorSnap = await db.collection('users').doc(req.params.vendorId).get()

  if (!vendorSnap.exists || vendorSnap.data().role !== 'vendor') {
    return res.status(404).json({ error: 'Vendor not found' })
  }

  const { name, description } = vendorSnap.data()

  const snap = await db
    .collection('listings')
    .where('vendorId', '==', req.params.vendorId)
    .get()

  const visible = snap.docs
    .filter((doc) => {
      const l = doc.data()
      return l.listingStatus === 'active' && l.moderationStatus === 'approved'
    })
    .map((doc) => ({ id: doc.id, ref: doc.ref, ...serialize(doc.data()) }))

  visible.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  const listings = await Promise.all(
    visible.map(async ({ ref, ...listing }) => {
      const imgSnap = await ref.collection('images').orderBy('order').limit(1).get()
      const firstImage = imgSnap.empty
        ? null
        : { id: imgSnap.docs[0].id, ...serialize(imgSnap.docs[0].data()) }
      return { ...listing, firstImage }
    })
  )

  return res.json({ vendor: { name, description }, listings })
}
