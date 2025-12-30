# Pastebin Lite

A lightweight pastebin application that allows users to create and share text snippets with optional expiry times and view limits.

## Features

- Create text pastes with shareable URLs
- Optional time-to-live (TTL) expiry
- Optional view count limits
- Clean, modern UI

## Running Locally

1. Install dependencies:
```bash
   npm install
```

2. Set up environment variables in `.env.local`:
```
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
```

3. Run the development server:
```bash
   npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Persistence Layer

This application uses **Vercel KV (Redis)** for data persistence. Vercel KV is a serverless Redis solution that provides:
- Persistent storage across serverless function invocations
- Fast key-value operations
- TTL support for automatic expiry
- High availability

## Deployment

Deploy to Vercel:
```bash
vercel
```

Make sure to set the KV environment variables in your Vercel project settings.

## Design Decisions

- **Vercel KV**: Chosen for seamless integration with Vercel's serverless platform
- **nanoid**: Used for generating short, URL-safe paste IDs
- **Atomic operations**: View counting uses Redis INCR for race-condition safety
- **Deterministic time**: Supports TEST_MODE for automated testing with x-test-now-ms header