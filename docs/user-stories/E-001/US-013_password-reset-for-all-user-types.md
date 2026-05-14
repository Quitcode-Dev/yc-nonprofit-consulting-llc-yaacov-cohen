---
id: "785564ae-1a90-46bc-945e-07764dfcc81c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
code: "US-013"
title: "Password Reset for All User Types"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "12"
version: "1"
created_at: "2026-05-06 11:11:48.948337+00"
updated_at: "2026-05-06 11:18:49.418413+00"
---

# US-013: Password Reset for All User Types

**Epic:** [E-001: User Authentication & Role-Based Access Control](../../epics/E-001_user-authentication-role-based-access-control.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 12  
**Version:** 1

## User Story

As a **platform user (Super Admin, Organization Admin, or Solicitor)**, I want to reset my password via a secure email link when I have forgotten it so that I can regain access to my account without requiring manual intervention from a system administrator.

## Acceptance Criteria

- Given I am on the login page, when I click 'Forgot Password' and enter my registered email address, then a password reset email is sent to that address if an account exists
- Given a password reset email is sent, when I click the reset link within 1 hour, then I am directed to a form to enter and confirm a new password
- Given a password reset token has expired (after 1 hour), when I click the link, then I see an error message and am prompted to request a new reset email
- Given I successfully reset my password, when I submit the new password form, then my old password is invalidated and I am redirected to the login page
- Given I request a password reset for an email not associated with any account, when the request is submitted, then the system shows the same confirmation message as a valid request to prevent email enumeration
- Given a password reset link has already been used, when it is clicked again, then the server returns an error stating the link is no longer valid

