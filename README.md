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

The app uses IndexedDB (Idb) to persist notes locally, allowing complete offline operation. 

## Status-Based Note Management
Notes are tagged with statuses such as synced, syncing,  unsynced and Error, allowing us to handle synchronization when the network is restored.

## Simple Conflict Resolution (Currently Missing)

Conflict resolution UI to manually resolve sync conflicts is mIssing

## Smart Sync Logic
- Notes created or edited offline are synced via POST or PUT requests when app detect network status is online.
- Notes marked as deleted offline are removed from the server via DELETE calls when netwrok status is online.
- Notes created offline use a temporary ID prefixed with offline-.
- If a note is created offline and then deleted offline, it will not be synced to the server.
- Added Search Filter to Filter the notes from the sidebar using title and descriptions.
- Notes created, Updated and deleted offline are stored in Idb and show in category in Ui and once app detect the netwrok it synced the data with server and clear the indexDb.
- 



