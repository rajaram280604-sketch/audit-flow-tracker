# Audit Flow Tracker: persistent engagement foundation

## Goal
Convert the first user-facing workflow from local prototype state to confirmed, authenticated database state without redesigning the existing AuditFlow UI or deleting existing audit data.

## Confirmed current state
- The database currently contains 7 audit tables: engagements, engagement_members, materiality_assessments, materiality_versions, misstatements, time_entries, and audit_events. All are RLS-enabled and existing foreign keys, unique indexes, timestamp triggers, materiality immutability trigger, and grants will be preserved.
- The current home screen in `src/routes/index.tsx` stores engagements, queries, hours, documents, materiality, and activity entirely in React state. Its save notices are therefore not database confirmations.
- The project already has a browser database client, bearer-token attachment for server functions, and server-side bearer validation, but the current home screen has no sign-in flow or authenticated route boundary.
- A security scan confirmed four broken member joins using `m.engagement_id = m.engagement_id`. Those rules can expose or allow writes to another engagement’s misstatements, materiality assessments, time entries, and audit events.
- Audit events currently allow authenticated members to insert arbitrary event payloads directly. This does not meet the requested append-only, trusted-event requirement.

## Delivery sequence

### 1. Harden existing access before adding new tables
Create an incremental migration that:
- Replaces the four tautological member joins with explicit comparisons to the protected row’s `engagement_id`.
- Separates owner, member, and preparer/reviewer checks so cross-engagement access is impossible.
- Removes authenticated table-level ability to write or alter audit events directly. Existing events remain untouched.
- Adds a validated append-only `record_audit_event` database function, called by authenticated TanStack server functions. The actor is derived from the verified session, event types and engagement membership are validated server-side, and audit rows have no update/delete path.
- Tightens existing materiality and misstatement mutation rules as part of the role migration rather than granting broader access. Approved materiality remains immutable and its version history remains append-only.

### 2. Add identity, firm, client, and engagement authorization model
Add separate tables and enums through migration, with explicit grants before RLS on every new public table:
- `user_profiles`: user-facing display name, avatar/contact fields, and preferences only. No permissions or engagement roles. The key is the authenticated user UUID; authentication remains owned by Cloud Auth.
- `firms`: firm name and profile settings.
- `clients`: firm-owned client records and identifying fields.
- `firm_members`: user-to-firm relationship with a firm role enum such as owner, admin, partner, manager, or staff. This is the firm authorization layer.
- `audit_areas`: firm/engagement-compatible audit area catalog with code, name, and active state.
- Extend `engagements` with firm and client relationships while retaining existing owner, code, year, status, and audit fields for compatibility. Existing rows will not be deleted or reset; new relationship columns will remain safely nullable until a data-backed backfill is possible.
- Extend `engagement_members` with a constrained engagement role enum and review permissions while retaining existing display fields. A user may have different roles on different engagements.

RLS will be role-based: firm members can see only their firm’s permitted records; engagement members can see only engagements they belong to; firm/engagement administrators can manage membership; ordinary members cannot grant themselves access or change their own authorization. Profile reads/updates will be limited to the user’s own profile plus the minimum display information required for authorized engagement views.

### 3. Implement real email/password authentication
Add a public sign-in/sign-up experience and authenticated engagement workspace without changing the established visual language:
- Email/password sign-up and sign-in using the existing browser client.
- Profile creation/update after authentication, with a clear confirmation-email state if Cloud Auth requires email confirmation.
- Session-aware account controls, sign-out with query-cache cleanup, and redirect back to the workspace after sign-in.
- An authenticated route boundary for the engagement workspace; server functions will independently enforce bearer authentication and role authorization.
- No client-side storage or hardcoded identity will be used for authorization.

### 4. Replace only the Engagement setup data path first
Keep the current layout, navigation, dialogs, and visual styling, but replace the hardcoded engagement setup path with server-confirmed data:
- Load the signed-in user’s firms, clients, memberships, and engagements through authenticated server functions using RLS.
- Make the engagement switcher and engagement list read from the database.
- Make “Create engagement” validate input, derive the owner/member identity from the authenticated session, persist the row, and update the UI only after the database returns the created record.
- Add client creation/selection and member assignment only for users authorized by firm/engagement role.
- Show explicit loading, empty, validation, permission-denied, and save-failed states. No success toast will be shown for an unconfirmed write.
- Leave query, hours, documents, materiality, review notes, and activity display in local state for this milestone, but remove any wording that implies those local actions are durably saved until their domains are wired.

### 5. Record the remaining workpaper model in the architecture roadmap only
Prepare the follow-on schema/data model as separate migrations, preserving existing tables and history:
- `workpapers` and workpaper versions linked to engagements, audit areas, preparers, reviewers, status, conclusions, and evidence references.
- `queries`, `management_responses`, and `auditor_evaluations` with explicit workflow ownership and immutable decision/audit history.
- `documents` and `document_versions` linked to engagements/workpapers, with file metadata and version checksums; storage upload will be added only when the storage workflow is implemented.
- `review_notes` with preparer response and reviewer clearance states.
- Extend the existing misstatement register with workpaper/query links and role-safe SA 450 workflows while preserving current rows and materiality version history.
- `tcwg_matters`, `tcwg_communications`, and `consultations` with engagement-scoped visibility and immutable decision records.
- Preserve and extend `materiality_assessments`, `materiality_versions`, and `audit_events` rather than replacing them.

## Data and authorization rules
- All ownership and actor IDs are derived from the validated bearer token; caller-supplied alternative owner IDs are ignored or rejected.
- No roles are stored on profiles. Firm roles and engagement roles are separate relationship records, allowing different roles per engagement.
- Every new public table will have grants, RLS, indexes, timestamps, and only the minimum role-specific policies required.
- Foreign keys will connect firm → client → engagement → engagement member/workpaper/query/document domains and preserve existing engagement foreign keys.
- Audit events are append-only, actor-bound, engagement-scoped, and created only through validated trusted operations.
- No destructive migration, table reset, data truncation, or rename will be used.

## Verification before completion
- Re-run the security scan and database linter after the hardening migration; the four privilege-escalation findings must be gone.
- Inspect the final policies, grants, triggers, indexes, and foreign keys after each migration.
- Exercise email/password sign-in and sign-out in the live preview.
- With a signed-in session, create an engagement and confirm the returned database row is rendered. Attempt a caller-supplied alternate owner and confirm it cannot take effect.
- Verify an authorized member can access only their engagement and an unauthorized user cannot read or write it.
- Verify audit events can be appended through the trusted path but cannot be updated, deleted, or injected for another engagement.
- Run typecheck/build and browser checks at the existing desktop viewport without redesigning the UI.
