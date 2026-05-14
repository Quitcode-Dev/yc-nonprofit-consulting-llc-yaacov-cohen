---
id: "213c1798-5564-43e4-ad93-33765eeb2bbb"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
code: "US-009"
title: "Super Admin Login with Full Platform Access"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "8"
version: "1"
created_at: "2026-05-06 11:11:48.948337+00"
updated_at: "2026-05-06 11:18:35.181912+00"
---

# US-009: Super Admin Login with Full Platform Access

**Epic:** [E-001: User Authentication & Role-Based Access Control](../../epics/E-001_user-authentication-role-based-access-control.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 8  
**Version:** 1

## User Story

As a **Super Admin**, I want to log in to the platform with my credentials and access all organizations and global settings so that I can manage the platform, onboard client organizations, and oversee all activity across the system.

## Acceptance Criteria

- Given valid Super Admin credentials, when I submit the login form, then I am redirected to the Super Admin dashboard showing all organizations
- Given I am logged in as Super Admin, when I navigate to any organization's data, then I can view and manage it without restriction
- Given I am logged in as Super Admin, when I access global settings, then I can create, edit, and delete global Move Ideas and manage organization accounts
- Given invalid credentials are submitted, when the login form is processed, then an error message is displayed and access is denied
- Given a Super Admin session, when the server receives a request, then role authorization is enforced server-side and cannot be bypassed by client-side manipulation
- Given I am logged in as Super Admin, when I attempt to access an Organization Admin or Solicitor restricted route, then access is granted because Super Admin supersedes all roles

