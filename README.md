This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```





## 📦 Tech Stack


# Frontend

- **Next** (with Context Api)
- **TypeScript**
- **IndexedDB** (via `idb`)
- **Shadcn UI**

# Backend

- **Node**
- **Express**
- **MongoDB**

---


Design Decisions & Tradeoffs

## Offline-First Architecture

The app uses IndexedDB to persist notes locally, allowing complete offline operation. 

## Status-Based Note Management
Notes are tagged with statuses such as synced, unsynced and Error, allowing us to handle synchronization more intelligently when the network is restored.

## Simple Conflict Resolution (Currently Missing)

No complex conflict resolution is currently implemented. The app assumes that the local changes are always correct and pushes them to the server once back online.

## Smart Sync Logic
Notes created or edited offline are synced via POST or PUT requests.
Notes marked as deleted offline are removed from the server via DELETE calls.
Notes created offline use a temporary ID prefixed with offline-.
If a note is created and then deleted offline, it will not be synced to the server.


