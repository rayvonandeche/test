import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { browseListings, getListingDetail } from '../controllers/listingController.js'

const router = Router()

// Browse/view is open to any authenticated user (buyers and vendors).
router.get('/', verifyToken, browseListings)
router.get('/:id', verifyToken, getListingDetail)

export default router
