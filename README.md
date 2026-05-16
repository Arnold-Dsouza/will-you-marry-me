
# Will You Marry Me | Christian Matrimony

A modern, faith-first Christian matrimonial platform built with Next.js, Firebase, and GenAI.

## Features
- **Spiritual Identity**: Comprehensive profiles including denomination, church involvement, and values.
- **AI Profile Optimizer**: GenAI-powered bio enhancement to help you express your faith authentically.
- **Soulmate AI**: Advanced matchmaking using LLMs to find partners based on spiritual alignment.
- **Real-time Chat**: Secure messaging for intentional connections.

## Deployment to GitHub

To upload this project to your GitHub account, follow these steps in your terminal:

1. **Initialize Git**:
   ```bash
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit your changes**:
   ```bash
   git commit -m "Initial commit: Christian Matrimony App"
   ```

4. **Create a new repository on GitHub**:
   Go to [github.com/new](https://github.com/new) and create a repository named `will-you-marry-me`.

5. **Link and Push**:
   Replace `YOUR_USERNAME` with your actual GitHub username:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/will-you-marry-me.git
   git branch -M main
   git push -u origin main
   ```

## Deployment to Vercel

Once your code is on GitHub, follow these steps:

1. **Login to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. **Import Project**: Click "Add New" -> "Project" and select your `will-you-marry-me` repository.
3. **Configure Environment Variables**:
   In the "Environment Variables" section, add the following (copy the values from your `src/firebase/config.ts` or `.env`):
   - `GOOGLE_GENAI_API_KEY`: Your Gemini API Key (required for AI features).
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API Key.
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain.
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket.
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Messaging Sender ID.
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase App ID.
4. **Deploy**: Click "Deploy". Vercel will build and host your app.

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:9002](http://localhost:9002) in your browser.
