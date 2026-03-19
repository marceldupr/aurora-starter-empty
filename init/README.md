# Init - first-run (optional)

This folder is for **first-run setup** when your app needs to provision an Aurora schema.

The empty starter does **not** provision any schema by default. You add tables in Aurora Studio or build your own.

If you want automatic provisioning (like the e-commerce template):

1. Add `init/schema.json` with your tables (and optional reports/workflows).
2. Add `init/provision.ts` and root `instrumentation.ts` that call the Aurora provision API. See the [e-commerce starter](https://github.com/marceldupr/aurora-starter-ecom) for the pattern.

Env vars for any Aurora API calls: `AURORA_API_URL` (or `NEXT_PUBLIC_AURORA_API_URL`) and `AURORA_API_KEY`.
