# Remix Error Boundary - Bug repro

## The bug

In the `/jokes/new` route, the only thing the `ActionFunction` is doing is throwing an error, which should be catched by the `ErrorBoundary` component in the same route. Instead, you should see a global app error, catched by the root `ErrorBoundary`. The error is:

```
TypeError: Cannot read property 'user' of undefined
    at `{data.user ? (` (./app/routes/jokes.tsx:50:16)
    [...]
```

Looks like the loader data of the `/jokes` route is `undefined` when an error is thrown in the `/jokes/new` route.

## How to reproduce

1. Clone this repo
2. Run `npm i`
3. Create a .env file and add `DATABASE_URL="file:./dev.db"` in it, along with `SESSION_SECRET="whatever"`
4. Seed the DB: `npx prisma db seed`
5. Run the app: `npm run dev`
6. Click "Read jokes", then "Add your own" (or go to http://localhost:3000/jokes/new)
7. Submit the form
