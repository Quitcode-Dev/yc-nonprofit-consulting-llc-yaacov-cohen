---
id: "15472a40-403b-4351-a24b-86bb14fb4fc1"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-040"
title: "Organization Admin edits and deletes an organization-specific Move Idea"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "39"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:28:52.829776+00"
---

# US-040: Organization Admin edits and deletes an organization-specific Move Idea

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 39  
**Version:** 1

## User Story

As a **Organization Admin**, I want to edit or delete Move Ideas I have created for my organization so that I can maintain an accurate and relevant custom library for my solicitor team.

## Acceptance Criteria

- Each organization-specific Move Idea in the admin list has an Edit action that opens a pre-populated form
- Saving an edited organization Move Idea immediately updates the Title and Category in the library
- Each organization-specific Move Idea has a Delete action that triggers a confirmation prompt
- Confirming deletion removes the Move Idea from the organization library and it no longer appears in the move creation dropdown for new moves
- Deleting an organization Move Idea does not delete or alter historical moves that referenced it
- An Organization Admin cannot edit or delete global Move Ideas
- An Organization Admin cannot edit or delete Move Ideas belonging to a different organization

