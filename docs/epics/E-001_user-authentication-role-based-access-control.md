---
id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-001"
title: "User Authentication & Role-Based Access Control"
priority: "must"
status: "approved"
order: "0"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:04:46.05053+00"
---

# E-001: User Authentication & Role-Based Access Control

**Priority:** must  
**Status:** approved  
**Order:** 0  
**Version:** 1

## Description

Establish secure, multi-role authentication for Super Admins, Organization Admins, and Solicitors. Each role must have clearly scoped access permissions that enforce data isolation between organizations. This epic underpins all other platform functionality and must be delivered first.

## Acceptance Criteria

- Super Admin can log in and access all organizations and global settings
- Organization Admin can log in and access only their own organization's data
- Solicitor can log in and access only their assigned donors and moves
- Email-based invitation flow allows Admins to invite Solicitors who complete signup via a tokenized link
- Invited Solicitors cannot access the platform until they complete registration
- Role permissions are enforced server-side, not just client-side
- Sessions expire and re-authentication is required after inactivity
- Password reset flow is available to all user types
- Unauthorized access attempts return appropriate error responses

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-009 | Super Admin Login with Full Platform Access | must | M | approved | [../user-stories/E-001/US-009_super-admin-login-with-full-platform-access.md](../user-stories/E-001/US-009_super-admin-login-with-full-platform-access.md) |
| US-010 | Organization Admin Login with Scoped Access | must | M | approved | [../user-stories/E-001/US-010_organization-admin-login-with-scoped-access.md](../user-stories/E-001/US-010_organization-admin-login-with-scoped-access.md) |
| US-011 | Solicitor Login with Assigned Donor Access Only | must | M | approved | [../user-stories/E-001/US-011_solicitor-login-with-assigned-donor-access-only.md](../user-stories/E-001/US-011_solicitor-login-with-assigned-donor-access-only.md) |
| US-012 | Solicitor Invitation via Tokenized Email Link | must | L | approved | [../user-stories/E-001/US-012_solicitor-invitation-via-tokenized-email-link.md](../user-stories/E-001/US-012_solicitor-invitation-via-tokenized-email-link.md) |
| US-013 | Password Reset for All User Types | must | M | approved | [../user-stories/E-001/US-013_password-reset-for-all-user-types.md](../user-stories/E-001/US-013_password-reset-for-all-user-types.md) |
| US-014 | Session Expiration and Re-Authentication | should | S | in_review | [../user-stories/E-001/US-014_session-expiration-and-re-authentication.md](../user-stories/E-001/US-014_session-expiration-and-re-authentication.md) |
| US-016 | Solicitor Registration Completion via Invitation | must | M | approved | [../user-stories/E-001/US-016_solicitor-registration-completion-via-invitation.md](../user-stories/E-001/US-016_solicitor-registration-completion-via-invitation.md) |
