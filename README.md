# Undo

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

An ephemeral digital journaling & thought-purging web and mobile application powered by React, Tailwind CSS, and Google Gemini AI.

## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5d0f326e-1091-4f26-b94c-1b2c2c97fc8f

## Supabase analytics

The mobile app's analytics now post to a Supabase Edge Function instead of using the service role key on-device. See [undo-mobile/supabase/README.md](undo-mobile/supabase/README.md) for the exact secrets and deploy flow.

## Privacy Policy

Undo is designed with a privacy-first, ephemeral architecture. Read our full [Privacy Policy](PRIVACY.md) or view the web page at [`privacy.html`](privacy.html).

## Run Locally


**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

