import { auth, db } from './config/firebase.js'

const now = new Date()

// Demo password for all seeded accounts (matches proposal test data).
const SEED_PASSWORD = 'Qwerty@123'

const users = {
  admin001: {
    name: 'Admin User',
    email: 'admin@strathmore.edu',
    role: 'administrator',
    description: null,
    contactPreference: null,
    isVerified: true,
    accountStatus: 'active',
    suspendedAt: null,
    suspendedBy: null,
    suspensionReason: null,
    createdAt: now,
    updatedAt: now
  },
  vendor001: {
    name: 'Emmanuel Onyango',
    email: 'emmanuel.onyango@strathmore.edu',
    role: 'vendor',
    description: 'Handcrafted leather goods and accessories',
    contactPreference: 'message',
    isVerified: true,
    accountStatus: 'active',
    suspendedAt: null,
    suspendedBy: null,
    suspensionReason: null,
    createdAt: now,
    updatedAt: now
  },
  vendor002: {
    name: 'Brian Mwangi',
    email: 'brian.mwangi@strathmore.edu',
    role: 'vendor',
    description: 'Thrift and vintage clothing for campus style',
    contactPreference: 'message',
    isVerified: true,
    accountStatus: 'active',
    suspendedAt: null,
    suspendedBy: null,
    suspensionReason: null,
    createdAt: now,
    updatedAt: now
  },
  vendor003: {
    name: 'Faith Wanjiru',
    email: 'faith.wanjiru@strathmore.edu',
    role: 'vendor',
    description: 'Homemade snacks and treats, freshly prepared',
    contactPreference: 'message',
    isVerified: true,
    accountStatus: 'active',
    suspendedAt: null,
    suspendedBy: null,
    suspensionReason: null,
    createdAt: now,
    updatedAt: now
  },
  buyer001: {
    name: 'Rayvon Andeche',
    email: 'rayvon.andeche@strathmore.edu',
    role: 'buyer',
    description: null,
    contactPreference: null,
    isVerified: true,
    accountStatus: 'active',
    suspendedAt: null,
    suspendedBy: null,
    suspensionReason: null,
    createdAt: now,
    updatedAt: now
  }
}

const events = {
  event001: {
    name: 'May Flea Market',
    startDate: new Date('2026-05-19T00:00:00Z'),
    endDate: new Date('2026-05-24T23:59:59Z'),
    status: 'active',
    createdBy: 'admin001',
    createdAt: now,
    updatedAt: now,
    closedAt: null
  }
}

function listing({ vendorId, title, description, category, price, searchKeywords }) {
  return {
    vendorId,
    eventId: 'event001',
    title,
    description,
    category,
    price,
    currency: 'KSh',
    listingStatus: 'active',
    moderationStatus: 'approved',
    searchKeywords,
    createdAt: now,
    updatedAt: now,
    approvedBy: 'admin001',
    approvedAt: now,
    removedBy: null,
    removedAt: null,
    removalReason: null
  }
}

const listings = {
  listing001: listing({
    vendorId: 'vendor001',
    title: 'Handmade Leather Bag',
    description: 'Hand-stitched bag made from genuine local leather.',
    category: 'Accessories',
    price: 1800,
    searchKeywords: ['bag', 'leather', 'handmade', 'accessories']
  }),
  listing002: listing({
    vendorId: 'vendor001',
    title: 'Leather Card Wallet',
    description: 'Slim hand-finished wallet, holds up to six cards.',
    category: 'Accessories',
    price: 900,
    searchKeywords: ['wallet', 'leather', 'accessories']
  }),
  listing003: listing({
    vendorId: 'vendor002',
    title: 'Vintage Sneakers',
    description: 'Classic vintage sneakers in good condition, size 42.',
    category: 'Clothing',
    price: 2500,
    searchKeywords: ['sneakers', 'vintage', 'shoes', 'clothing']
  }),
  listing004: listing({
    vendorId: 'vendor002',
    title: 'Denim Jacket',
    description: 'Lightly worn denim jacket, unisex medium fit.',
    category: 'Clothing',
    price: 1500,
    searchKeywords: ['denim', 'jacket', 'clothing']
  }),
  listing005: listing({
    vendorId: 'vendor003',
    title: 'Snack Pack',
    description: 'Assorted snack pack — perfect between classes.',
    category: 'Food',
    price: 300,
    searchKeywords: ['snacks', 'food']
  }),
  listing006: listing({
    vendorId: 'vendor003',
    title: 'Mandazi Box (6 pcs)',
    description: 'Freshly fried mandazi, soft and lightly spiced.',
    category: 'Food',
    price: 200,
    searchKeywords: ['mandazi', 'snacks', 'food']
  })
}

// Overwrites each doc so re-seeding refreshes existing data
// (e.g. reassigning a UID to a new account email/name).
async function seedCollection(collectionName, docs) {
  for (const [id, data] of Object.entries(docs)) {
    await db.collection(collectionName).doc(id).set(data)
    console.log(`set    ${collectionName}/${id}`)
  }
}

// If the target email is held by a different UID (e.g. an account
// registered manually during testing), delete that stray account so
// the email is free for the canonical seeded UID.
async function freeEmail(email, keepUid) {
  try {
    const existing = await auth.getUserByEmail(email)
    if (existing.uid !== keepUid) {
      await auth.deleteUser(existing.uid)
      console.log(`delete auth/${existing.uid} (freed ${email})`)
    }
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err
  }
}

// Upserts a Firebase Auth account per seeded user, with the same UID
// as their Firestore doc, so the demo users can actually log in.
// If the UID already exists, its email/password/name are updated.
async function seedAuthUsers() {
  for (const [uid, data] of Object.entries(users)) {
    await freeEmail(data.email, uid)
    const profile = {
      email: data.email,
      password: SEED_PASSWORD,
      displayName: data.name
    }
    try {
      await auth.createUser({ uid, ...profile })
      console.log(`create auth/${uid} (${data.email})`)
    } catch (err) {
      if (err.code === 'auth/uid-already-exists') {
        await auth.updateUser(uid, profile)
        console.log(`update auth/${uid} (${data.email})`)
      } else {
        throw err
      }
    }
  }
}

async function main() {
  await seedAuthUsers()
  await seedCollection('users', users)
  await seedCollection('events', events)
  await seedCollection('listings', listings)
  console.log(`Seed complete — demo accounts use password: ${SEED_PASSWORD}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
