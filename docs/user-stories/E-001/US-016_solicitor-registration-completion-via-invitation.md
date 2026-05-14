---
id: "5b7ad08e-4f3f-4708-a8d4-e0ae5556f08c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
code: "US-016"
title: "Solicitor Registration Completion via Invitation"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "15"
version: "1"
created_at: "2026-05-06 11:11:48.948337+00"
updated_at: "2026-05-06 11:19:55.318674+00"
---

# US-016: Solicitor Registration Completion via Invitation

**Epic:** [E-001: User Authentication & Role-Based Access Control](../../epics/E-001_user-authentication-role-based-access-control.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 15  
**Version:** 1

## User Story

As a **invited Solicitor**, I want to complete my account registration by setting my name and password via the tokenized invitation link so that I can activate my account securely without needing a temporary password or admin assistance.

## Acceptance Criteria

- Given I receive an invitation email, when I click the tokenized link, then I am directed to a registration page pre-populated with my email address (read-only)
- Given I am on the registration page, when I enter my first name, last name, and a password meeting minimum requirements (at least 8 characters, at least one number, at least one special character), then I can submit the form to complete registration
- Given I submit the registration form with a password that does not meet minimum requirements, when validation runs, then an inline error message specifies the unmet requirements and the form is not submitted
- Given I submit a valid registration form, when the account is created, then I am immediately logged in and redirected to my Solicitor dashboard scoped to my assigned organization
- Given I have completed registration, when I attempt to use the same invitation link again, then the server returns an error stating the link has already been used
- Given registration is complete, when my account record is inspected server-side, then my role is set to Solicitor and my organization association matches the inviting organization

