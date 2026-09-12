# Marginalia — Engineering Standards & Architectural Guidelines

This document outlines the authoritative tech stack, architectural boundaries, security principles, and engineering & UX rules for the **Marginalia** platform.

---

## 1. System Overview & Technology Stack

Marginalia is a collaborative, tactile sticky-notes and checklist productivity platform designed to recreate natural desktop organization with modern web resilience.

### Frontend
- **Framework & Core**: React 18, TypeScript, Vite
- **Data Synchronization**: TanStack Query (`@tanstack/react-query`) for all server-side cache and asynchronous state
- **Routing & Navigation**: React Router v7 with URL search params state synchronization (`useSearchParams`)
- **Client State Management**: Zustand (`zustand`) strictly isolated for transient, client-only UI states (modals, drawers, command palette, active filters)
- **UI Components & Primitives**: shadcn/ui built upon Radix UI primitives
- **Styling**: Tailwind CSS v4, custom CSS variables, and tactile card drop shadows
- **Form & Validation**: React Hook Form + Zod (`zod`) for client-side schema validation
- **Feedback & Interactions**: Sonner (`sonner`) toast notifications, `cmdk` command palette
- **Graphics & 3D (Policy)**: 2D-first layout. Heavy 3D engines (Three.js, Rapier) are omitted to preserve low bundle weight and rapid time-to-interactive. If 3D components are introduced, the 3D decoupling rules in Section 3 apply.

### Backend
- **Runtime & Server**: Node.js (>= 18.0.0), Express
- **Language**: TypeScript (`tsc`, `ts-node-dev`)
- **Database & ODM**: MongoDB Atlas, Mongoose
- **Authentication**: JWT (`jsonwebtoken`) issued via secure, httpOnly cookies + password hashing via `bcryptjs` / `argon2`
- **Validation**: Schema-driven request validation
- **Real-Time Communication**: Socket.io (optional real-time note collaboration)

### Security & Observability
- **Header Security**: Helmet (`helmet`) with default security headers
- **CORS**: Strict origin whitelisting via environment variable `ALLOWED_ORIGIN`
- **Rate Limiting**: `express-rate-limit` with global IP limits and strict auth route throttling
- **Parameter Pollution**: `hpp` to neutralize HTTP parameter pollution attacks
- **NoSQL Injection Sanitization**: Safe in-place recursive stripping of MongoDB operator keys (`$`, `.`)
- **Payload Limits**: Strict JSON body and URL-encoded limits (`50kb`)
- **Auditing**: `npm audit` and Dependabot vulnerability tracking

---

## 2. Engineering & UX Rules

### 1. Skeleton Loaders (shadcn/ui)
- **Rule**: Use layout-matched wireframe placeholders during fetches to eliminate Cumulative Layout Shift (CLS).
- **Mandate**: **Never use full-screen blank spinners** or unstyled centered loading text. Skeletons must mirror the exact dimensions, borders, and grid layout of the content being loaded (e.g., `NotesSkeleton` replicating the masonry note cards).

### 2. Granular Suspense
- Wrap individual widgets, route segments, and independently fetched sections in React `<Suspense>` boundaries.
- Auxiliary failures or slower endpoints (e.g., calendar widgets, notifications) must stream independently without blocking primary note interactions.

### 3. Optimistic UI (TanStack Query)
- Apply immediate client-side UI updates on user actions (e.g., checking checklist items, deleting notes, adding tags).
- Implement `onMutate` cache snapshots with automatic rollbacks in `onError` if a network mutation fails.

### 4. State Boundary Separation
- **Server Data**: Must reside exclusively in TanStack Query cache. Never mirror query results into local `useState` or Redux/Zustand unless creating isolated scratchpads.
- **Client UI States**: Modals, drawer open states, command palette toggles, active filter selections, and destructive confirmation targets belong in dedicated Zustand stores.

### 5. Server-Side Pagination (TanStack Table)
- For high-volume collections, paginate datasets on the backend using `limit`, cursor/offset, and sort parameters.
- Provide responsive pagination controls and infinite scroll handlers where appropriate.

### 6. URL State Synchronization
- Synchronize active category filters, search queries, view modes, and sorting with URL search params (`?category=Work&search=meeting`).
- Ensures all view states are directly bookmarkable and shareable without losing context on page reloads.

### 7. Inline Schema Validation (Zod)
- Validate form inputs in real time with field-level error messages matching backend validation schemas.
- Prevent invalid requests from reaching the network layer.

### 8. Command Palette (`cmdk` / shadcn/ui)
- Provide a global `Cmd+K` / `Ctrl+K` command modal for quick note searching, category switching, note creation, and account actions.

### 9. Contextual Empty States
- Whenever a query returns zero items (e.g., empty search, newly created category), render a contextual visual illustration, an explanatory heading, and a primary call-to-action button (e.g., "Create Note" or "Clear Search Filter").

### 10. Action Feedback (Sonner Toasts)
- Use floating toast notifications for user actions.
- Any destructive or mutating action (such as note deletion) must include an actionable **"Undo"** or **"Retry"** button in the toast.

### 11. Destructive Confirmations (AlertDialog)
- Require explicit confirmation dialogs using shadcn/ui `AlertDialog` before executing permanent deletions (notes, categories) or critical account updates.

### 12. Isolated Error Boundaries
- Contain component and route crashes with local fallback error cards featuring retry triggers (`handleRetry`), preventing an isolated UI crash from taking down the entire dashboard.

---

## 3. 3D & Graphics Guidelines (If Extended)

If 3D widgets, interactive desktop models, or canvas animations are integrated:
1. **3D Loop Decoupling (R3F)**: Never invoke `setState` inside `useFrame()`. Update Three.js object transforms directly via mutable refs.
2. **Simplified Physics (Rapier)**: Restrict dynamic rigid bodies to primitive colliders (`cuboid`, `sphere`, `capsule`). Never generate high-poly mesh colliders on tick.
3. **Asset Lifecycle Management**: Preload 3D assets with `useGLTF.preload()` and explicitly dispose of unused textures, materials, and geometries on unmount.

---

## 4. Backend Sanitization & Security Standards

1. **In-Place MongoDB Operator Stripping**:
   - Recursively traverse `req.body`, `req.params`, and `req.query` to delete any keys starting with `$` or containing `.`.
   - Never reassign the `req.query` object itself, respecting modern Node runtime getter-only protections.
2. **Rate Limiting**:
   - General API endpoints: 100 requests per 15-minute window.
   - Auth endpoints (`/login`, `/register`): 10 attempts per 15-minute window with informative error messages.
3. **HTTP Parameter Pollution (HPP)**:
   - Protect query string parameters against array pollution attacks via `hpp()`.
4. **File Buffer Verification**:
   - If user uploads are supported, never trust file extensions or client-sent MIME types. Inspect magic bytes using `file-type` on memory buffers before storage.
