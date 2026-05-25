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

# Optional Google Sheets backup for new admin listings
GOOGLE_SHEETS_ENABLED=false
GOOGLE_SHEET_ID=<spreadsheet-id>
GOOGLE_SHEET_TAB=Listings
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY=<service-account-private-key>

# Optional Cloudinary image uploads for List your property
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
CLOUDINARY_FOLDER=zac-living/listings

# Optional AI helper, global bot, and smart room search
AI_PROVIDER=gemini
GEMINI_API_KEY=<google-ai-studio-api-key>
GEMINI_MODEL=gemini-2.0-flash

# OpenAI-compatible fallback options
AI_API_KEY=<openai-compatible-api-key>
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
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

## Google Sheets Listing Backup

To save new admin listings into a Google Sheet:

1. Create a Google Cloud service account and generate a JSON key.
2. Create a Google Sheet with a tab named `Listings`.
3. Share the Sheet with the service account email as an editor.
4. Add the Google env vars in Render.
5. Set `GOOGLE_SHEETS_ENABLED=true`.

Recommended Sheet header row:

```txt
Created At | Listing ID | Title | Owner Name | Owner Contact | Owner Address | Area | Landmark | Rent | Deposit | Room Type | Category | Food | Availability | Published | Video URL | Description
```

## AI Helper

The app can run without an AI key. When `AI_PROVIDER=gemini` and `GEMINI_API_KEY` are set, owner listing drafts, the global helper bot, and smart room search use Google Gemini. Without a key, the app uses a deterministic fallback so forms and search still work.
