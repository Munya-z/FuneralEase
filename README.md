# FuneralEase

South African funeral-policy vault and claims companion for families, burial societies, and parlours.

## Structure

```
funeralease/
├── api/        # .NET 8 API + PostgreSQL
├── web/        # Next.js apps (consumer :3000, admin :3001, parlours :3002)
├── android/    # Kotlin Compose consumer app
└── docs/       # Product spec
```

## Quick start

### API + database

```bash
cd api
cp .env.example .env   # optional overrides
docker compose up --build
# API → http://localhost:5001  |  Swagger in Development
```

Or run the API locally (Postgres must be up):

```bash
cd api
dotnet run --project src/FuneralEase.Api
```

### Web apps

```bash
cd web
pnpm install
pnpm dev
```

| App | URL |
|-----|-----|
| Consumer | http://localhost:3000 |
| Admin | http://localhost:3001 |
| Parlours | http://localhost:3002 |

Set `NEXT_PUBLIC_API_URL` (default `http://localhost:5001`) in each app’s `.env.local` if needed.

### Admin staff login (Development)

Configured in `api/src/FuneralEase.Api/appsettings.Development.json`:

- Email: `admin@funeralease.co.za`
- Password: `dev-admin-password`
- TOTP (required in Development): `123456`

Override in production via env:

```bash
Admin__StaffEmail=...
Admin__StaffPassword=...
Admin__RequireTotp=true
Admin__StaffTotp=...
```

## Paystack (upgrade payments)

1. Copy `api/.env.example` → `api/.env`
2. Paste your **secret key** from the Paystack dashboard (Settings → API Keys):

```bash
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
```

3. Restart the API:

```bash
cd api && docker compose up --build -d api
```

For local webhooks (plan activation after payment), use a tunnel (e.g. ngrok) to  
`POST https://<your-tunnel>/webhooks/paystack` and set that URL in the Paystack dashboard.

## Production checklist

- [ ] Rotate `Jwt__Secret`, `Encryption__Key`, and admin credentials
- [ ] Set `Anthropic__ApiKey` only via secrets (never commit)
- [ ] Configure `PAYSTACK_SECRET_KEY` for subscriptions
- [ ] Switch `Notifications:Provider` off Logging → WhatsApp/SMS when ready
- [ ] Switch `Storage:Provider` to GCS for documents
- [ ] Point web apps at the production API URL
- [ ] Restrict CORS origins in `Program.cs` to real domains

## Product

Track funeral policies, get lapse warnings, run claims checklists, manage household / burial-society contributions, and access related tools (digital vault, wishes, parlour directory, estate checklist, obituary assist, fundraisers, grief journal, emergency access).
