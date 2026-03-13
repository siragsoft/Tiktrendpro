# TikTok Viral Analyzer

A full-stack application to analyze TikTok videos, predict virality, and provide actionable insights using AI.

## Features
- **Video Analysis**: Hook score, visual content, transcript.
- **Hashtag Analysis**: Evaluates hashtags based on search volume/competition and suggests 5 alternatives.
- **Sentiment Analysis**: Uses Gemini to analyze a sample of comments.
- **Audio to Text**: Simulates OpenAI Whisper API / Google Cloud Speech-to-Text for transcription.
- **Multilingual**: English, Arabic, French.
- **Dark Mode**: Fully responsive and dark mode supported.
- **Stripe Integration**: Premium and Pro subscription plans.
- **Social Sharing**: Easy sharing of analysis results.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: Firebase Firestore.
- **AI**: Google Gemini Pro.

## Local Development

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd tiktok-viral-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example` and fill in your keys.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Google Cloud Run (Automated)
This project includes a `Dockerfile` and `cloudbuild.yaml` for easy deployment to Google Cloud Run.
1. Connect your GitHub repository to Google Cloud Build.
2. Set up the trigger to use `cloudbuild.yaml`.
3. Add your environment variables (`_GEMINI_API_KEY`, `_STRIPE_SECRET_KEY`, `_VITE_STRIPE_PUBLIC_KEY`) in the Cloud Build trigger settings.

### Hostinger (Node.js Hosting)
1. Access your Hostinger hPanel and navigate to your Node.js hosting environment.
2. Connect your GitHub repository or upload the files via FTP.
3. Run `npm install` and `npm run build` via the Hostinger terminal.
4. Set the startup command to `npm start` (which runs `node server.ts` or `tsx server.ts`).
5. Add your environment variables in the Hostinger control panel.

### GitHub
The project is structured to be easily pushed to GitHub. The `.gitignore` file ensures sensitive data and `node_modules` are not committed.
