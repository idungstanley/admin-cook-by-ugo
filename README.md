# Cook by Ugo Admin

The staff dashboard for Cook by Ugo. It works alongside the
[customer site](https://github.com/idungstanley/cook-by-ugo) and uses the same brand tokens.

All data comes from the [API](https://github.com/idungstanley/api-cooked-by-ugo), which enforces every
role and business rule. This app only controls what each person sees.

## Getting started

Start the API first, then:

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs on http://localhost:5174. Sign in with a seeded staff account, as described in the
API's README. Two-step sign-in is turned on from Staff and roles.

## Modules

| Module            | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| Sign in           | Email and password, two-step code, password reset screen        |
| Roles             | Owner, Kitchen and Rider access, enforced on routes and actions |
| Live orders       | Board with alerts, overdue flags and allergy warnings           |
| Order detail      | Items, activity log, ETA, rider, print ticket, cancel           |
| Refunds, payments | Full or partial refunds, cash or card collection on delivery    |
| Order history     | Search, filter by status and date, export to CSV                |
| Dishes            | Add, edit, reorder and delete dishes, with sold-out switches    |
| Options           | Proteins, sides and spice levels, and which dishes use them     |
| Deals             | Prices, contents, active days and dates                         |
| Shop settings     | Hours, closures, pause orders, zones, fees, payment methods     |
| Customers         | Order history, block list, data export and deletion             |
| Content           | Homepage text, favourites, contact details, catering enquiries  |
| Reports           | Sales, orders, top dishes, payment split and monthly growth     |

Orders appear on the board live, and the chime plays for each new one.

## Scripts

| Script          | What it does         |
| --------------- | -------------------- |
| `npm run dev`   | Start the dev server |
| `npm run build` | Type-check and build |
| `npm run lint`  | Run ESLint           |
| `npm test`      | Run unit tests       |

## Project structure

```text
src/
  components/
    charts/     Reusable chart pieces
    layout/     App shell, sidebar, top bar
    ui/         Reusable kit: Button, DataTable, fields, Drawer, Modal...
  constants/    Navigation, roles, order rules, query keys
  features/     One folder per module, with its pages and logic
  hooks/        Reusable hooks
  lib/          Small helpers: formatting, CSV, class names
  routes/       TanStack Router pages
  services/     One folder per domain: `*.api.ts` and `*.queries.ts`
  stores/       Zustand stores
  styles/       Global CSS and design tokens
  types/        Shared TypeScript types
```

## Conventions

- **Colours:** add or change a colour in `src/styles/globals.css`, then expose it in
  `tailwind.config.ts`. Never hard-code a hex value.
- **Money:** always whole pence. Forms use pounds and convert on save.
- **Data:** components call hooks from `src/services`. Only `*.api.ts` files call the API.
- **Writes:** use `useAppMutation`, so data refreshes and feedback stay consistent.
- **Access:** add permissions in `src/constants/roles.ts`, and guard routes with `requirePermission`.

## Before launch

- **Allergens:** the seeded lists are not verified. Update each dish with the kitchen's real data.
- **Delivery zones and fees:** the seeded values are assumptions until the client confirms them.

## Deploying

Publish to `admin.cookedbyugo.com`, because staff sign-in only works when the dashboard and API share
a domain. Set `VITE_API_URL` to `https://api.cookedbyugo.com` before building, then publish `dist`.
Every path must serve `index.html`. Netlify reads this from `public/_redirects`, and other hosts need
a rewrite rule from `/*` to `/index.html`.
