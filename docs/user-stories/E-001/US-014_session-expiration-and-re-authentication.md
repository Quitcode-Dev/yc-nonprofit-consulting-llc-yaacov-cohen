---
id: "8408b60d-987e-4904-83a5-578bdc054d5d"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "e009c821-b0e0-4cb8-b623-cb1b8599e6e5"
code: "US-014"
title: "Session Expiration and Re-Authentication"
priority: "should"
effort_estimate: "S"
status: "in_review"
order: "13"
version: "1"
created_at: "2026-05-06 11:11:48.948337+00"
updated_at: "2026-05-06 11:33:43.001324+00"
---

# US-014: Session Expiration and Re-Authentication

**Epic:** [E-001: User Authentication & Role-Based Access Control](../../epics/E-001_user-authentication-role-based-access-control.md)  
**Priority:** should  
**Effort Estimate:** S  
**Status:** in_review  
**Order:** 13  
**Version:** 1

## User Story

As a **platform user**, I want my session to automatically expire after a period of inactivity so that unauthorized individuals cannot access my account if I leave my browser unattended.

## Acceptance Criteria

- Given I am logged in as any user role, when my session has been inactive for 30 minutes, then my session is invalidated server-side
- Given my session has expired, when I attempt to perform any action or navigate to any protected page, then I am redirected to the login page with a message stating my session has expired
- Given my session has expired and I log in again, when authentication succeeds, then I am redirected to the page I last attempted to access
- Given I am actively using the platform, when I perform actions within the inactivity window, then my session timer resets and I am not logged out
- Given a session token has been invalidated by expiration, when it is replayed in an API request, then the server returns a 401 Unauthorized response and does not return any data

