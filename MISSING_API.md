# Missing / Incomplete Backend APIs

Audit of `blurp-engine` (Rust/Axum) vs frontend needs, focused on user-facing
features. Generated while wiring `src/lib/api/*` against
`crates/blurp-server/src/main.rs` routes.

Frontend API base URL: `NEXT_PUBLIC_API_BASE_URL` (see `.env.local.example`).

---

## 1. User profile (`/api/users/me`) — MISSING

**Need:** GET current user profile (id, email, username, name, created_at,
admin flag) using Bearer JWT.

**Status:** No `/api/users/me` route exists. `crates/blurp-auth/src/user.rs`
has `UserService::get_by_id` but it is only called by login internals.

**Frontend workaround:** `src/lib/api/users.ts#getCurrentUser` decodes JWT
claims (`sub`, `email`) client-side. Replace with real call once shipped.

**Suggested route:**

```rust
// blurp-server/src/main.rs
.route("/api/users/me", axum::routing::get(AuthHandlers::me))
.route("/api/users/me", axum::routing::put(AuthHandlers::update_me))
```

```rust
// blurp-auth/src/handlers.rs
pub async fn me(State(state): State<AppState>, AuthUser(user_id): AuthUser) -> Response {
    let svc = UserService::new(state.db.clone());
    match svc.get_full_by_id(user_id).await { /* ... */ }
}
```

Response (proposed):

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user",
    "name": "User",
    "is_admin": false,
    "created_at": "2026-..."
  },
  "error": null,
  "meta": null
}
```

---

## 2. Update profile (`PUT /api/users/me`) — MISSING

Allow user to change `name`, optionally `username`. No route exists.
Admin can update via `PUT /api/admin/users/{id}`, but that's admin-only.

---

## 3. Change password (`POST /api/users/me/password`) — MISSING

No endpoint for authenticated password change. `PasswordService` exists
in `blurp-auth` but no handler.

---

## 4. Password reset flow — MISSING

No `POST /api/auth/forgot-password` or `POST /api/auth/reset-password`.
Magic link partially substitutes but is login-only.

---

## 5. Refresh token flow — MISSING

JWT TTL is 900s (15 min). No `/api/auth/refresh`. Frontend currently
forces re-login on expiry. `FEATURES.md` lists this as a known gap.

**Frontend behavior today:** `client.ts` returns 401 → caller must catch
`ApiError` with `status === 401` and redirect to `/login`.

---

## 6. OAuth / Google login — PARTIAL

`blurp-auth/src/oauth.rs` has `OAuthService` (DB linking only). No HTTP
routes for `/api/auth/google` start or callback. Login UI has a disabled
"Lanjut dengan Google" button.

Suggested:

```
GET  /api/auth/google           -> redirect to Google
GET  /api/auth/google/callback  -> exchange code, issue JWT
```

---

## 7. Addresses (`/api/users/me/addresses`) — MISSING

Frontend `app/profile/page.tsx` shows "Alamat" with "Segera" badge.
There is no address book table or endpoints. Order checkout currently
requires `shipping_address` inline every time.

Suggested DB:

```sql
CREATE TABLE auth.user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  label TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  district_id INT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Suggested routes:

```
GET    /api/users/me/addresses
POST   /api/users/me/addresses
GET    /api/users/me/addresses/{id}
PUT    /api/users/me/addresses/{id}
DELETE /api/users/me/addresses/{id}
PUT    /api/users/me/addresses/{id}/default
```

---

## 8. Notification preferences — MISSING

Profile page lists "Notifikasi" with "Segera" badge. No endpoints for
opt-in/out of order updates, promo, etc.

Suggested:

```
GET /api/users/me/notifications
PUT /api/users/me/notifications
```

---

## 9. Order list pagination + filters — PARTIAL

`GET /api/orders` returns full list for user. No `?status=`, no
`?page=&per_page=`. For large order history this won't scale.

Add query params + `meta.pagination` (envelope already supports it via
`Meta::paginated`).

---

## 10. Cancel / re-order endpoints — MISSING

No `POST /api/orders/{id}/cancel` for user-initiated cancellation while
status is `pending`. No `POST /api/orders/{id}/reorder` to rebuild cart
from a past order.

---

## 11. Order tracking detail (timeline) — UNCLEAR

`OrderDetail` exposes `status` but no event history. `orders.fulfillment`
table exists but isn't returned in `GET /api/orders/{id}`. Frontend
tracker would benefit from a status timeline.

Suggested addition to `OrderDetail`:

```rust
pub events: Vec<OrderEvent>,   // status transitions w/ timestamp
pub fulfillment: Option<Fulfillment>,
```

---

## 12. Logout is no-op — KNOWN

`POST /api/auth/logout` returns success but does not blacklist the JWT.
With short-lived (15 min) tokens this is acceptable, but documenting:

- Frontend must clear localStorage (handled in `useAuth#logout`).
- For real revocation: add a Redis-backed JWT denylist keyed by `jti`.

---

## 13. Wishlist response shape — UNVERIFIED

Frontend `src/lib/api/wishlist.ts` types are best-effort: backend
`WishlistService` not yet inspected for exact JSON. If/when wired, run a
real call against dev server and tighten types in
`crates/blurp-wishlist/src/models.rs` (Serde) ↔ `wishlist.ts`.

---

## 14. Email-based username for magic link — INCONSISTENCY

`magic_link_callback` calls `UserService::get_or_create(&email)` which
inserts into `auth.users` with `is_guest = false` and **no `username`**
or `password_hash`. `RegistrationService::register_with_password` requires
`username` (NOT NULL). Need DB to allow nullable `username` for magic-link-
only users, or generate one (e.g. email local part). Confirm migration.

---

## Summary table

| Area              | Status   | Priority |
|-------------------|----------|----------|
| GET /users/me     | ✅ done  | high     |
| PUT /users/me     | ✅ done  | medium   |
| Password change   | ✅ done  | medium   |
| Password reset    | ✅ done  | medium   |
| Refresh token     | ✅ done  | high     |
| OAuth Google      | partial  | medium   |
| Addresses CRUD    | ✅ done  | high     |
| Notif prefs       | missing  | low      |
| Orders pagination | ✅ done  | medium   |
| Cancel order      | missing  | medium   |
| Order events      | missing  | medium   |
| Logout revocation | known    | low      |
| Wishlist types    | unverified | low    |
| Magic-link user row | ✅ resolved (username nullable in DB) | high |

---

_Last updated: 2026-05-08 — see `src/lib/api/` for client side._

---

## Resolved (2026-05-08)

Backend endpoints added in `blurp-engine`:

- `GET /api/users/me` — user profile via JWT
- `PUT /api/users/me` — update name/username/phone
- `POST /api/users/me/password` — change password (requires current)
- `POST /api/auth/refresh` — refresh token rotation (7-day refresh TTL)
- `POST /api/auth/forgot-password` — request password reset email
- `POST /api/auth/reset-password` — reset with token
- `GET/POST /api/users/me/addresses` — list/create addresses
- `GET/PUT/DELETE /api/users/me/addresses/{id}` — address CRUD
- `PUT /api/users/me/addresses/{id}/default` — set default address
- `GET /api/orders?page=&per_page=&status=` — paginated + filtered

All auth endpoints now return `refresh_token` in addition to `access_token`.
Migration `20260508_003_add_user_addresses.sql` adds address table.
Magic-link username issue resolved — `username` column already nullable in DB schema.
