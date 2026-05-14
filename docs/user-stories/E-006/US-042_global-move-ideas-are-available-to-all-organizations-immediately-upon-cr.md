---
id: "50348de2-8a1c-480f-8c93-72bd87383676"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-042"
title: "Global Move Ideas are available to all organizations immediately upon creation"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "41"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:29:09.463393+00"
---

# US-042: Global Move Ideas are available to all organizations immediately upon creation

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 41  
**Version:** 1

## User Story

As a **Super Admin**, I want changes I make to global Move Ideas to be reflected across all organizations instantly so that all organizations always have access to the most current set of global cultivation templates without requiring any action from their admins.

## Acceptance Criteria

- A newly created global Move Idea appears in the move creation selector for all organizations without requiring a page refresh beyond normal browser navigation
- An edited global Move Idea's updated Title and Category are displayed in the move creation selector for all organizations after the edit is saved
- A deleted global Move Idea no longer appears in the move creation selector for any organization after deletion is confirmed
- The update is reflected for a solicitor in Organization A and a solicitor in Organization B independently to confirm cross-organization propagation
- No Organization Admin action is required to receive the updated global Move Ideas

