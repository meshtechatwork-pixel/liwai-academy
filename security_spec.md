# Learn It With AI — Firestore Security Specification

## 1. Data Invariants
1. **Course & Lesson Integrity**: Every lesson in `/lessons/{lessonId}` must reference an existing `/courses/{courseId}` document (`exists(...)`). Only verified administrators can create, update, or delete courses, lessons, categories, course levels, and website content.
2. **PII Isolation & Role Lock**: `/users/{userId}` holds student PII (`email`, `phone`, `country`, `countyOrState`, `townOrCity`). Only the profile owner (`request.auth.uid == userId`) or an administrator can read a user document. Students cannot self-assign `role: 'admin'` on creation or modify `role`, `uid`, or `createdAt` on update.
3. **Enrollment & Progress Ownership**: Every enrollment and progress record must reference an existing course (`exists(/databases/$(database)/documents/courses/$(incoming().courseId))`). Students can only create, read, or update records where `userId == request.auth.uid`. Completed records (`status == 'completed'`) are terminally locked for non-admin updates.
4. **Certificate Anti-Forgery & Public Verification**: Students can only claim a certificate and public verification record if their corresponding `/progress/{uid}_{courseId}` document has `status == 'completed'` (checked via `getAfter(...)`), or an administrator can issue them directly. Public verification lookup (`/certificate_verifications/{certificateCode}`) allows single-document `get` without exposing student email, phone, or address.
5. **Prompt History & Favourite Isolation**: `/prompts/{promptId}` is strictly owner-readable and owner-writable; updates are restricted exclusively to toggling `isFavorite`.
6. **Notifications Isolation**: `/notifications/{notificationId}` is strictly readable by its owner (`userId == request.auth.uid`) or admin; owners may only update `isRead` to `true`.
7. **Spoof-Proof Admin Identity**: Bootstrapped admin email checks (`meshtechatwork@gmail.com`) strictly require `request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Assigned Admin Role on Registration**: `POST /users/{uid}` with `{ role: "admin" }`. -> `PERMISSION_DENIED`.
2. **Shadow Update on User Profile**: `PATCH /users/{uid}` adding `{ isVerified: true }`. -> `PERMISSION_DENIED`.
3. **Cross-User PII Read**: Student A calls `GET /users/{studentB}` or `LIST /users`. -> `PERMISSION_DENIED`.
4. **Unverified Admin Email Spoof**: User with `email: "meshtechatwork@gmail.com"`, `email_verified: false` writes to `/courses/{id}`. -> `PERMISSION_DENIED`.
5. **Orphaned Lesson**: Write `/lessons/{id}` referencing non-existent `courseId`. -> `PERMISSION_DENIED`.
6. **Orphaned Enrollment**: Student creates `/enrollments/{uid}_fakeCourse`. -> `PERMISSION_DENIED`.
7. **Terminal State Tampering**: Student updates `/progress/{uid}_{courseId}` when `status == 'completed'`. -> `PERMISSION_DENIED`.
8. **Forged Certificate**: Student creates `/certificates/{id}` without completed progress. -> `PERMISSION_DENIED`.
9. **ID Poisoning**: Write `/courses/invalid id!@#` with forbidden characters. -> `PERMISSION_DENIED`.
10. **Client-Injected Timestamp**: Create `/prompts/{id}` with backdated `createdAt`. -> `PERMISSION_DENIED`.
11. **Value Poisoning**: Update `/progress/{id}` with `progressPercent: 999`. -> `PERMISSION_DENIED`.
12. **Prompt Content Tampering**: Student attempts to overwrite `generatedPrompt` on `/prompts/{id}` instead of only toggling `isFavorite`. -> `PERMISSION_DENIED`.
