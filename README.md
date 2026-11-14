# Learn It With AI

**Learn It With AI** is a full-stack online learning platform built with React, TypeScript, Tailwind CSS, Express, server-side Gemini AI, and Firebase (Authentication, Cloud Firestore, and Storage).

## Features
- **5 Learning Categories**: Web Design, Web Development, Social Media Management, Video Editing, and AI Prompt Generator across Beginner, Intermediate, and Advanced tiers.
- **16 Pages**: Home, About Us, All Courses, Course Details, AI Prompt Generator, Student Registration, Student Login, Student Dashboard, My Learning, My Profile, Certificates (with PDF/print & public verification), Admin Dashboard, Contact Us, FAQ, Privacy Policy, and Terms and Conditions.
- **Interactive AI Prompt Generator**: Server-side `@google/genai` (`gemini-4-hydrogen`) prompt engineering supporting ChatGPT, Google Gemini, Claude, and Microsoft Copilot with prompt history and favourites.
- **Role-Based Admin Console**: Manage courses, thumbnails, lessons, video uploads, downloadable resources, students, categories, levels, website content, and certificate issuance.

## Installation
```bash
npm install
```

## Firebase Configuration
1. Firebase client settings are stored in `firebase-applet-config.json`.
2. In the [Firebase Console](https://console.firebase.google.com/), enable **Email/Password** and **Google** under **Authentication → Sign-in method**.
3. Deploy Firestore & Storage rules:
```bash
firebase deploy --only firestore:rules,storage
```

## Development & Production Build
```bash
# Development server (Express + Vite on port 3000)
npm run dev

# Type check & production bundle
npm run lint
npm run build
npm start
```
