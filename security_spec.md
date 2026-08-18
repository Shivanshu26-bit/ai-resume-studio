# Firestore Security Specification & Invariants

## 1. Data Invariants

- **Isolated User Profiles (`users/{userId}`)**:
  - A user profile document can only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid` exactly matches `{userId}`.
  - Unauthenticated access is completely denied.
  - Cross-user profile inspection or modification is completely denied.

- **Private Nested Resumes (`users/{userId}/resumes/{resumeId}`)**:
  - A resume document belongs strictly to its parent user path `{userId}`.
  - An authenticated user can only perform CRUD operations (create, read, update, delete, and list) on resumes inside their own subcollection `users/{their-own-uid}/resumes/{resumeId}`.
  - No user can access or query another user's resume collection (`users/{otherUid}/resumes`).
  - Unauthenticated requests have zero access.
  - Global catch-all default-deny `match /{document=**} { allow read, write: if false; }` prevents any unauthorized access across all other database collections.

## 2. Access Matrix

| Path | Operation | Authenticated Owner (`request.auth.uid == userId`) | Authenticated Non-Owner (`request.auth.uid != userId`) | Unauthenticated (`request.auth == null`) |
|---|---|---|---|---|
| `users/{userId}` | `get` / `read` | ALLOW | DENY | DENY |
| `users/{userId}` | `create` | ALLOW (with valid ID) | DENY | DENY |
| `users/{userId}` | `update` | ALLOW (with valid ID) | DENY | DENY |
| `users/{userId}` | `delete` | ALLOW (with valid ID) | DENY | DENY |
| `users/{userId}/resumes` | `list` / `query` | ALLOW | DENY | DENY |
| `users/{userId}/resumes/{resumeId}` | `get` / `read` | ALLOW | DENY | DENY |
| `users/{userId}/resumes/{resumeId}` | `create` | ALLOW (with valid IDs) | DENY | DENY |
| `users/{userId}/resumes/{resumeId}` | `update` | ALLOW (with valid IDs) | DENY | DENY |
| `users/{userId}/resumes/{resumeId}` | `delete` | ALLOW (with valid IDs) | DENY | DENY |
| Any other collection / root | Any | DENY | DENY | DENY |

## 3. Red Team Security Payload Test Cases

1. **Unauthenticated Read Profile**: Request `GET /users/user_abc123` with no auth header -> `PERMISSION_DENIED`
2. **Unauthenticated List Resumes**: Query `/users/user_abc123/resumes` with no auth header -> `PERMISSION_DENIED`
3. **Unauthenticated Create Resume**: `POST /users/user_abc123/resumes/res-1` with no auth header -> `PERMISSION_DENIED`
4. **Cross-User Read Profile**: User `uid_alice` requests `GET /users/uid_bob` -> `PERMISSION_DENIED`
5. **Cross-User List Resumes**: User `uid_alice` queries `/users/uid_bob/resumes` -> `PERMISSION_DENIED`
6. **Cross-User Get Resume**: User `uid_alice` requests `GET /users/uid_bob/resumes/res-secret` -> `PERMISSION_DENIED`
7. **Cross-User Update Resume**: User `uid_alice` updates `/users/uid_bob/resumes/res-secret` -> `PERMISSION_DENIED`
8. **Cross-User Delete Resume**: User `uid_alice` deletes `/users/uid_bob/resumes/res-secret` -> `PERMISSION_DENIED`
9. **Malicious ID Injection**: User `uid_alice` creates `/users/uid_alice/resumes/<1KB_garbage_id>` failing `isValidId` -> `PERMISSION_DENIED`
10. **Global Catch-All Probe**: Any user requests `GET /admin_secrets/config` -> `PERMISSION_DENIED`
11. **Valid Owner Create Resume**: User `uid_alice` creates `/users/uid_alice/resumes/res-1` -> `ALLOW`
12. **Valid Owner Read & Update**: User `uid_alice` reads and updates `/users/uid_alice/resumes/res-1` -> `ALLOW`
