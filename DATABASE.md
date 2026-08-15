# Database setup (Postgres / CockroachDB)

The store works with **two interchangeable backends**:

- **No `DATABASE_URL` set** → it uses the local file `data/store.json` (great for quick local dev; resets are easy).
- **`DATABASE_URL` set** → it uses your Postgres / CockroachDB database (durable, scales, safe for production).

The app **creates its own tables and seeds them on first run** — there are no migration commands to run.

## Turn on the database

1. Create a `.env` file in the project root (copy from `.env.example`).
2. Add your connection string:

   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:26257/defaultdb?sslmode=verify-full"
   ```

3. Start the app:

   ```
   npm install
   npm run build
   npm run start
   ```

On first start it will:
- create the tables (`products`, `categories`, `brands`, `testimonials`, `orders`, `settings`),
- load the current catalogue into them.

Open the **CockroachDB Cloud dashboard → Data** to watch real orders and customers appear as you use the site.

## Notes

- **Never commit `.env`.** It holds the database password. It is already git-ignored.
- To switch back to the local file store, just remove/blank `DATABASE_URL` and restart.
- The database only stores **records** (products, orders, customers, settings). **Product images** live in `public/products` / `public/uploads`, served by the app — not in the database.
- Set a strong `ADMIN_PASSWORD` in `.env` before going live (defaults to `admin123`).
- Rotate the database password before launch if it was ever shared (create a new SQL user in CockroachDB and update `DATABASE_URL`).
