---
id: "c81ef145-ea0d-4ef2-9208-c3aaafd4beff"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
code: "US-010"
title: "Organization Admin Login with Scoped Access"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "9"
version: "1"
created_at: "2026-05-06 11:11:48.948337+00"
updated_at: "2026-05-06 11:18:38.514476+00"
---

# US-010: Organization Admin Login with Scoped Access

**Epic:** [E-001: User Authentication & Role-Based Access Control](../../epics/E-001_user-authentication-role-based-access-control.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 9  
**Version:** 1

## User Story

As a **Organization Admin**, I want to log in and access only my own organization's data, settings, and users so that I can manage my team and donor records without risk of accessing or exposing another organization's data.

## Acceptance Criteria

- Given valid Organization Admin credentials, when I submit the login form, then I am redirected to my organization's dashboard
- Given I am logged in as Organization Admin, when I attempt to access another organization's donor records or settings via URL manipulation, then the server returns a 403 Forbidden response
- Given I am logged in as Organization Admin, when I navigate the platform, then I can only see data, users, and settings belonging to my own organization
- Given I am logged in as Organization Admin, when I access solicitor management, then I can view, invite, and manage only solicitors within my organization
- Given invalid credentials are submitted, when the login form is processed, then a generic error message is shown and no organization data is exposed

