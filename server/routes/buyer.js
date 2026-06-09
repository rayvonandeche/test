import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireRole from '../middleware/requireRole.js'
import { createReport, getVendorPublicProfile } from '../controllers/buyerController.js'

const router = Router()

router.use(verifyToken)

// Viewing a vendor profile is open to any authenticated user;
// only the write action (reporting) is buyer-gated.
router.get('/vendors/:vendorId', getVendorPublicProfile)
router.post('/reports', requireRole('buyer'), createReport)

export default router
