# Cook by Ugo Admin

The staff dashboard for Cook by Ugo. It works alongside the
[customer site](https://github.com/idungstanley/cook-by-ugo) and uses the same brand tokens.

This is the frontend only. All data is mock data held in memory, so changes reset when the page
reloads. No real sign-in, payment, refund or email happens.

## Getting started

```bash
npm install
npm run dev
```

The app runs on http://localhost:5174.

### Demo accounts

Use the buttons on the sign-in page, then enter the code `123456`.

| Role    | Email                 | Can do                                    |
| ------- | --------------------- | ----------------------------------------- |
| Owner   | `owner@example.com`   | Everything                                |
| Kitchen | `kitchen@example.com` | Live orders and sold-out switches         |
| Rider   | `rider@example.com`   | Assigned deliveries and payment collected |

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

Use **Simulate order** on the board to trigger a new order and the alert.

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
  mocks/        In-memory database and seed data
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
- **Data:** components call hooks from `src/services`. Only `*.api.ts` files touch `src/mocks`.
- **Writes:** use `useAppMutation`, so data refreshes and feedback stay consistent.
- **Access:** add permissions in `src/constants/roles.ts`, and guard routes with `requirePermission`.

## Connecting the backend

Replace the methods in each `*.api.ts` file with Appwrite calls. Query hooks and components stay
the same. Then:

- **Sign-in:** replace the demo password and code in `auth.api.ts` with Appwrite Auth and MFA.
  The current sign-in is not secure, so this app must not hold real data until then.
- **Permissions:** enforce roles on the server with Appwrite Teams and table permissions. The
  checks here only control what the interface shows.
- **Live orders:** replace polling with Appwrite Realtime, and remove the Simulate order button.
- **Riders:** only return each rider's own orders from the server.
- **Refunds:** run them through a server function that calls Stripe.
- **Images:** replace the temporary file URLs in `ImageField` with Appwrite Storage.

## Placeholders to replace before launch

- **Allergens:** the lists in `src/mocks/seed/menu.ts` are not verified.
- **Delivery zones and fees:** the seed values are assumptions until the client confirms them.
- **Sample people and orders:** all names, phone numbers and sales figures are made up.
