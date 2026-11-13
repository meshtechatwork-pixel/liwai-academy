# LIWAI ACADEMY Firestore Security Specification

## 1. Data Invariants
1. **Course Integrity**: Every lesson under `/courses/{courseId}/lessons/{lessonId}` must belong to an existing parent `/courses/{courseId}` document (`exists(...)`) and only administrators can create, update, or delete courses, lessons, or course levels.
2. **PII Isolation & Role Lock**: `/users/{userId}` holds student PII (`email`, `phone`, `country`, `countyOrState`, `townOrCity`). Only the profile owner (`request.auth.uid == userId`) or an administrator can read a user document. Students cannot self-assign `role: 'admin'` on creation or modify `role`, `uid`, or `createdAt` on update.
3. **Enrollment Ownership & Parent Existence**: An enrollment cannot exist without a valid parent `/courses/{courseId}` document (`exists(...)`). Students can only create, read, or update enrollments where `userId == request.auth.uid`. Completed enrollments (`status == 'completed'`) are terminally locked for non-admin updates.
4. **Certificate Atomicity & Anti-Forgery**: Students can only claim a certificate if their corresponding enrollment (`{userId}_{courseId}`) has `status == 'completed'` (checked via `get(...)` or `getAfter(...)` in an atomic batch), or an administrator can issue a certificate directly.
5. **Strict List Query Enforcement**: Every `allow list` rule evaluates `resource.data` directly (never relying on client query filtering) and never performs `get()` or `exists()` lookups inside `allow list`.
6. **Spoof-Proof Admin Identity**: Bootstrapped admin email checks (`meshtechatwork@gmail.com`) strictly require `request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Assigned Admin Role on Registration**: `POST /users/{uid}` with `{ role: "admin", ... }` by a student. -> `PERMISSION_DENIED`.
2. **Privilege Escalation Shadow Update**: `PATCH /users/{uid}` adding `{ role: "admin" }` or `{ isVerified: true }` (ghost field). -> `PERMISSION_DENIED`.
3. **Cross-User PII Read**: Authenticated Student A attempts `GET /users/{studentB_uid}` or `LIST /users`. -> `PERMISSION_DENIED`.
4. **Unverified Admin Email Spoof**: User with `email: "meshtechatwork@gmail.com"` and `email_verified: false` attempts admin write on `/courses/{id}`. -> `PERMISSION_DENIED`.
5. **Orphaned Enrollment**: Student creates `/enrollments/{uid}_fakeCourse` referencing a non-existent `courseId`. -> `PERMISSION_DENIED`.
6. **Enrollment Hijack**: Student A attempts to create `/enrollments/{studentB_uid}_course1` with `userId: studentB_uid`. -> `PERMISSION_DENIED`.
7. **Terminal State Tampering**: Student attempts to update an enrollment whose `status` is already `'completed'`. -> `PERMISSION_DENIED`.
8. **Forged Certificate**: Student creates `/certificates/{certId}` for a course without a `'completed'` enrollment. -> `PERMISSION_DENIED`.
9. **ID Poisoning**: Attempt to write `/courses/{2000-char-invalid-id}` with spaces or special characters. -> `PERMISSION_DENIED`.
10. **Client-Injected Timestamp**: Attempt to create `/enrollments/{id}` with a backdated `enrolledAt` or `updatedAt != request.time`. -> `PERMISSION_DENIED`.
11. **Value Poisoning**: Attempt to update `progressPercent` to `999` or `"100%"` (wrong type / out of bounds). -> `PERMISSION_DENIED`.
12. **Blanket Prompt Scraping**: Student A attempts `LIST /saved_prompts` without `where('userId', '==', studentA_uid)` or attempts `GET /saved_prompts/{studentB_prompt}`. -> `PERMISSION_DENIED`.
