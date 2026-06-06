# Deat Sell — Premium Instagram Growth Marketplace

Deat Sell is a highly polished, responsive, and completely standalone (pure frontend, zero-backend) marketplace tailored for premium Instagram growth services (including high-retention followers, comments, views, and promotional bundles). It has been engineered to run **100% offline** on the client browser after first load, leveraging Vite, React, Tailwind CSS v4, and Zustand state synchronization with direct `localStorage` persistence.

---

## ⚡ Main Technical Accomplishments & Bug Fixes

Here is how the system fixes previous architecture vulnerabilities reported in standard setups:

1. **Adding Products Resolved**: Forms utilize reliable state binding, support canvas compression encoding, auto-assign unique tags, and commit immutable arrays to the Zustand store, triggering instant public updates.
2. **Instant Deletions**: Deletes use simple array filtrations coupled with interactive visual confirmations. Changes write to the persistence layer instantly.
3. **Robust Image Uploader**: Integrates a HTML Drag & Drop zone feeding into standard Canvas decoders. Resizes uploads down to `800px` at `70% JPEG quality`, converting images into lightweight Base64 strings.
4. **Showing All Products**: Maps the entire products list directly from the hydrated Zustand state pool, resolving the single-rendering bug.
5. **No Data Loss on Refresh**: All state groups (products, promo events, and blogs) are linked to dedicated, distinct Zustand stores with standard `persist` persistence middleware.
6. **Strict Blog Compliance**: Includes case-insensitive validation blocks that prevent content submissions containing the blocked word `"SMM"`.

---

## 🔑 Operational Credentials

- **Admin Passcode**: `admin123`
- To access, click the **Admin Login** option inside the sticky header or head directly to the **Admin** tab.

---

## 🛠 Features Breakdown

### 1. Unified Dashboard Catalogs
- Custom category pills (`All`, `Followers`, `Likes`, `Views`, `Comments`, `Combos`) with fast filter queries.
- Dynamic search bar matching descriptions, headers, or tags.

### 2. Live Countdown Timers
- Interactive, ticking visual timers that count down days, hours, minutes, and seconds.
- Automatically handles date checks and hides expired products or discount campaigns from public shoppers.

### 3. Progressive Sandbox Checkout
- **Step 1: Application of Promo Codes:** Apply event discounts (e.g. `GROWTH50` for 50% Off, `REELS30` for 30% Off) with real-time price reductions in Indian Rupees (₹).
- **Step 2: Delivery Targets:** Includes a mandatory validation screen checking for public handles or URLs.
- **Step 3: Gateway Terminal:** Beautiful mock payment simulation containing progress spinners and NPCI security markers.
- **Step 4: Fulfillment Relays:** Renders order confirmation bills and conditional contact buttons (WhatsApp, Instagram DM, Messenger) matching what the administrator set for that product.

### 4. Administrator Console
- **Products CRUD:** Publish new titles, pick category tags, toggle flash timer dates, set isChatOnly flags, adjust operations relay links, and upload covers.
- **Events CRUD:** Launch promotional events, configure active voucher codes, adjust percentages, and set timestamps.
- **Blogs CRUD:** Compose informative strategy blueprints. Supports local comment submissions inside details views.

---

## 🏗 Seeding Specifications on First Launch

On first launch, if local state structures are completely empty, the system automatically hydrates:
- **10 Core Products** (covering high-grade followers, fast likes, drip comment packs, and explore page combos).
- **3 Special Event Countdowns** (with active dynamic offset future dates).
- **4 Educational Blogs** (detailing algorithm guidelines and story structures, with zero references to the word "SMM").

---

## 🚀 Local Run Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch dev environment**:
   ```bash
   npm run dev
   ```
3. **Production build compiler**:
   ```bash
   npm run build
   ```

---

## ☁ Firebase Migration Roadmap

If you decide to scale Deat Sell into a full-stack SaaS platform with multiple administrative logins, secure payments, and cloud-hosted operations, migrate from local storage using this structured roadmap:

### 1. Install Google Cloud SDKs
Include standard Firebase Core libraries:
```bash
npm install firebase
```

### 2. Configure Cloud Core
Initialize a centralized SDK instance (e.g., `src/lib/firebase.ts`):
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "deatsell.firebaseapp.com",
  projectId: "deatsell",
  storageBucket: "deatsell.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 3. Bridge Zustand to Firestore
Instead of storing state locally in `localStorage`, update your Zustand stores to execute asynchronous Firestore document calls. For example:

```typescript
// Replace:
deleteProduct: (id) => set((s) => ({ products: s.products.filter(p => p.id !== id) }))

// With:
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

deleteProduct: async (id) => {
  await deleteDoc(doc(db, "products", id));
  set((s) => ({ products: s.products.filter(p => p.id !== id) }));
}
```

---

## 📦 Deployment Instructions (Vercel)

Since Deat Sell is a clean, optimized Vite SPA, it deploys to **Vercel** in one step:

1. Create a Vercel project connected to your Git repository.
2. Select the **Vite** preset.
3. Keep default settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy! Vercel will build your client assembly and serve it globally through their Edge Network.
