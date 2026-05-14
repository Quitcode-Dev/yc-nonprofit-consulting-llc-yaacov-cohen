---
id: "f36361d0-0e0f-4a5c-bc18-d1b11d56fc6c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
code: "US-011"
title: "Solicitor Login with Assigned Donor Access Only"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "10"
version: "1"
created_at: "2026-05-06 11:11:48.948337+00"
updated_at: "2026-05-06 11:18:41.055767+00"
---

# US-011: Solicitor Login with Assigned Donor Access Only

**Epic:** [E-001: User Authentication & Role-Based Access Control](../../epics/E-001_user-authentication-role-based-access-control.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 10  
**Version:** 1

## User Story

As a **Solicitor**, I want to log in and see only the donors and moves assigned to me so that I can focus on my portfolio without being overwhelmed by or accidentally modifying other solicitors' data.

## Acceptance Criteria

- Given valid Solicitor credentials, when I submit the login form, then I am redirected to my personal dashboard showing only my assigned donors and moves
- Given I am logged in as a Solicitor, when I attempt to access another solicitor's donor profile or moves via URL manipulation, then the server returns a 403 Forbidden response
- Given I am logged in as a Solicitor, when I navigate to the donors list, then only donors assigned to me are displayed
- Given I am logged in as a Solicitor, when I attempt to access organization settings or admin panels, then the server returns a 403 Forbidden response
- Given I am logged in as a Solicitor, when I attempt to access Super Admin global settings via direct URL, then the server returns a 403 Forbidden response
- Given role permissions are configured, when any Solicitor request reaches the server, then authorization is validated server-side before any data is returned

