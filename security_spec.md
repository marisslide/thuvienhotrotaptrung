# Security Specification — Thư viện hoạt động hỗ trợ tái tập trung

## 1. Data Invariants
1. **Public vs. Hidden Separation**: Only documents in `/activities/{activityId}` with `status == 'published'` can be read (`get` or `list`) by unauthenticated visitors. Documents with `status == 'hidden'` are accessible only to authorized teachers/admins.
2. **Teacher RBAC Isolation**: Only verified users (`email_verified == true`) who are either the bootstrapped primary admin (`nguyenhaiquan1234@gmail.com`) or listed in `/teachers/{uid}` can create, update, or delete activities.
3. **Immutable Ownership & Timestamps**: `authorId` and `createdAt` on `/activities`, `uid` and `createdAt` on `/teachers` and `/teacher_requests` cannot be altered after creation. `createdAt` and `updatedAt` must equal `request.time`.
4. **Zero-Trust Validation**: Every document ID must match `^[a-zA-Z0-9_\-]+$` (<= 128 chars). Every string field enforces `.size()` limits matching `firebase-blueprint.json`. No ghost fields allowed (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
5. **No PII Leakage**: Teacher records and requests do not store personal emails or phone numbers in publicly readable collections, and `get`/`list` are strictly scoped to owner or bootstrapped admin.
6. **Zero-Lookup List Queries**: `allow list` rules never invoke `get()` or `exists()`.

## 2. The "Dirty Dozen" Attack Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Activity Write**: Anonymous/unauthenticated user tries `create` on `/activities/act_1`.
2. **Unauthorized Authenticated User Create**: Signed-in user not in `/teachers` tries `create` on `/activities/act_2`.
3. **Hidden Activity Public Read**: Unauthenticated visitor calls `get` or `list` (without `status == 'published'` filter) on a `status: 'hidden'` activity.
4. **Shadow Ghost Field Injection**: Authorized teacher sends `{ ...validActivity, isFeaturedAdminBypass: true }` on `create` or `update`.
5. **Identity Spoofing on Create**: Authorized teacher sets `authorId: 'someone-else-uid'` instead of `request.auth.uid`.
6. **Timestamp Forgery**: Teacher sends `createdAt: new Date('2020-01-01')` instead of `serverTimestamp()`.
7. **Immutable Field Tampering**: Teacher attempts to change `authorId` or `createdAt` during `update`.
8. **ID Poisoning**: Attacker attempts `create` at `/activities/` with a 300-character ID or invalid symbols like `../admin`.
9. **Value Poisoning / Size Exhaustion**: Teacher sends a 10KB string in `title` or `durationMinutes: 999` or empty `steps: []`.
10. **Self-Assigned Privilege Escalation**: Regular signed-in user tries `create` on `/teachers/{theirUid}` to make themselves an admin.
11. **Request Status Shortcutting**: User submits `/teacher_requests/{theirUid}` with `status: 'approved'` instead of `'pending'`, or updates their own pending request to `'approved'`.
12. **Unverified Email Spoofing**: User with `email_verified: false` tries any privileged write or admin check.
