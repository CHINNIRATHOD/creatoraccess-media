# CreatorAccess Media

CreatorAccess Media is a creator and brand collaboration website with a static frontend and an Express/MongoDB backend.

## Run locally

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env` with your values:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

3. Start the API:

```bash
npm start
```

4. Serve the website from the project root with any static server. Example:

```bash
npx serve . -l 3000
```

The frontend automatically uses `http://localhost:5000` when opened from localhost.

## Deploy

Deploy the backend first, then update the frontend API URL if your backend URL changes.

### Backend on Render

- Service type: Web Service
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`

Set `ALLOWED_ORIGINS` to your deployed frontend URL, for example:

```bash
https://your-site.netlify.app
```

### Frontend on Netlify or Vercel

- Publish directory: project root
- Build command: leave empty

If your backend is not `https://creatoraccess-media.onrender.com`, edit `js/api.js` and replace the production API URL.
