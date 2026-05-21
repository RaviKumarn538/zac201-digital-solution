# Zac.Living Deployment Notes

## Required Environment Variables

Set these in Render/Railway or your hosting provider:

```env
NODE_ENV=production
MONGO_URL=mongodb+srv://<username>:<password>@<cluster-url>/ZAc201_living?retryWrites=true&w=majority
SESSION_SECRET=<long-random-secret>
ADMIN_EMAIL=<your-private-admin-email>
ADMIN_PASSWORD=<strong-private-admin-password>
WHATSAPP_NUMBER=919301942717
```

Do not commit `.env` to GitHub.

## MongoDB Atlas

1. Create an Atlas cluster.
2. Create a database user.
3. Allow network access for your deployment provider.
4. Use the Atlas connection string as `MONGO_URL`.

The app stores:

- `users`
- `rooms`
- `visitrequests`
- `sessions`

## Hosting

Use:

```bash
npm install
npm start
```

Health check:

```txt
/health
```

Admin login route:

```txt
/zac-admin
```
