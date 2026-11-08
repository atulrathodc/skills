---
name: remix-app
description: Build, run, and debug Remix and React Router v7 full-stack web applications — loaders, actions, nested routes, SSR, form submissions, and error boundaries.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Remix App

Remix / React Router v7 full-stack specifics that trip up agents.

0. **Greenfield Scaffolding** — For a new Remix / React Router v7 app:
   `npx --yes create-remix@latest . --template remix-run/remix/templates/remix --no-install && npm install`
   Or for React Router v7:
   `npx --yes create-react-router@latest . --template basic && npm install`

1. **File-Based Routing** — Routes live in `app/routes/`. Flat route convention: `app/routes/posts._index.tsx` for `/posts`, `app/routes/posts.$id.tsx` for `/posts/:id`. Root layout lives in `app/root.tsx`.

2. **Loaders (GET) & Actions (POST/PUT/DELETE)**:
   - `export async function loader({ request, params }: LoaderFunctionArgs)` runs ONLY on the server. Return `json(data)` or raw Response objects.
   - `export async function action({ request }: ActionFunctionArgs)` processes mutations from `<Form method="post">`.
   - Consume loader data in components with `useLoaderData<typeof loader>()`.

3. **Server vs Client Execution**:
   - Code inside `loader` and `action` is server-only and stripped from client bundles.
   - Never import browser-only libraries (`window`, `localStorage`) outside `useEffect` or `ClientOnly` components.

4. **Forms & Optimistic UI**:
   - Use `<Form>` from `@remix-run/react` instead of raw `<form>` to enable client-side navigation without full-page reloads.
   - Use `useNavigation()` or `useFetcher()` for inline mutations and loading spinners.

5. **Error Boundaries** — Every route module can export an `ErrorBoundary()`:
   ```tsx
   export function ErrorBoundary() {
     const error = useRouteError();
     return isRouteErrorResponse(error) ? <div>{error.status} {error.statusText}</div> : <div>Error</div>;
   }
   ```

6. **Verify & Run** — `npm run dev` for development, `npm run build` then `npm start` for production. Verify by curling the HTML route and checking that SSR renders server data without hydration mismatches.
