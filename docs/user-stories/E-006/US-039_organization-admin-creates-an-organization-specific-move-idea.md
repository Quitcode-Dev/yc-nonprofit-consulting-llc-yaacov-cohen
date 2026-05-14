---
id: "b1f60dd7-0e04-452f-9c1f-01423e1d1eb0"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-039"
title: "Organization Admin creates an organization-specific Move Idea"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "38"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:28:12.285727+00"
---

# US-039: Organization Admin creates an organization-specific Move Idea

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 38  
**Version:** 1

## User Story

As a **Organization Admin**, I want to create custom Move Ideas specific to my organization so that my solicitors can select cultivation activities that reflect our organization's unique outreach strategies.

## Acceptance Criteria

- An Organization Admin can access a Move Ideas management section within their organization's settings
- The form requires a Title (max 150 characters) and a Category, both mandatory
- A saved organization-specific Move Idea is visible only to users within that organization and not to any other organization
- Organization-specific Move Ideas are visually distinguished from global Move Ideas in the management list (e.g., labeled 'Custom' or 'Organization')
- An Organization Admin cannot create, edit, or delete global Move Ideas
- Saving with a missing Title or Category displays a validation error and does not save

