---
id: "bdbc02c1-4858-465a-b5cd-e910adfd5435"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-038"
title: "Super Admin edits and deletes a global Move Idea"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "37"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:28:04.167801+00"
---

# US-038: Super Admin edits and deletes a global Move Idea

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 37  
**Version:** 1

## User Story

As a **Super Admin**, I want to edit or delete any Move Idea in the global library so that I can keep the global library accurate, current, and relevant for all organizations.

## Acceptance Criteria

- Each global Move Idea in the library list has an Edit action that opens a pre-populated form with the existing Title and Category
- Saving an edited Move Idea updates the record immediately and the updated values are reflected across all organizations
- Each global Move Idea has a Delete action that triggers a confirmation prompt before permanent removal
- Confirming deletion removes the Move Idea from the global library and it no longer appears in the move creation dropdown for new moves
- Deleting a global Move Idea does not delete or alter any historical move records that previously referenced it
- Historical moves that referenced a deleted Move Idea continue to display the original Move Idea title as a read-only reference
- Cancelling the delete confirmation prompt leaves the Move Idea unchanged

