# Frontend — Agent Notes

Read root `ai-instructions.md` first.

## Stack

- React 19, React Router 7, Framer Motion, Recharts
- Tailwind 4 via `@tailwindcss/vite`
- API base: `/api` (Netlify Function in prod; `@netlify/vite-plugin` in `npm run dev`)

## Key pages

| Route | Component |
|-------|-----------|
| `/dashboard?tab=overview` | `UserDashboard.jsx` — stats, AI plans, activity |
| `/dashboard?tab=classes` | Class booking grid |
| `/dashboard?tab=events` | Event registration |
| `/dashboard?tab=challenges` | Join + progress logging |
| `/dashboard?tab=nutrition` | Meal plans + `ActiveMealPlanPanel` + `FoodLog` |
| `/dashboard?tab=history` | `WorkoutHistory.jsx` |

Tab parsing: `getActiveDashboardTab()` in `src/constants/dashboardTabs.js`.

## State patterns

- **Auth:** `useAuth()` — `user`, `login`, `logout`, `updateUser(patch)`
- **Dashboard load:** `loadData()` in `UserDashboard` — parallel `Promise.all` with `safe()` fallbacks
- **Mutations:** `runAction(actionKey, asyncFn, successMessage)` + `Toast` component
- **Per-card loading:** pass `loading={actionLoading}` and `actionKey={actionKey}` to cards

## Styling rules

- Dashboard spacing: `src/styles/dashboard.css` (`.dashboard-card`, `.dashboard-grid`, workout plan, venue, meal panels)
- Auth: `src/styles/auth-glass.css`
- Buttons: `Button.jsx` + `.ui-button--*` in `index.css` — do not rely on Tailwind padding utilities alone

## Shared utilities

- `src/utils/capacity.js` — spots left / is full (handles null capacity)
- `src/utils/meals.js` — parse structured or legacy meal arrays
- `src/constants/venue.js` — Central Rama 2 Gym, Bangkok

## Adding a new dashboard feature

1. Extend `api.js`
2. Add state + handler in `UserDashboard.jsx`
3. Create or extend component in `src/components/`
4. Add styles to `dashboard.css` if needed
5. Verify with `npm run build`
