---
id: "dc5a293e-6902-4a04-8fa7-c59eed9b329c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
code: "US-030"
title: "Create a Move for an Assigned Donor"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "29"
version: "1"
created_at: "2026-05-06 11:24:29.550862+00"
updated_at: "2026-05-06 11:26:36.34766+00"
---

# US-030: Create a Move for an Assigned Donor

**Epic:** [E-005: Moves Management & Workflow](../../epics/E-005_moves-management-workflow.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 29  
**Version:** 1

## User Story

As a **Solicitor**, I want to create a move by selecting one of my assigned donors, choosing a Move Idea from the library, and setting a due date so that I have a structured, trackable outreach task recorded in the system.

## Acceptance Criteria

- Solicitor can only select donors assigned to them from the donor picker
- Move Idea picker displays all available Move Ideas from the library (global + org-level)
- Due date field is required and must be a valid future or present date
- Created move record stores: title (inherited from Move Idea), associated donor, associated solicitor (auto-assigned to logged-in user), due date, status defaulting to 'Pending', and creation date
- Solicitor is redirected to the move detail view or moves list upon successful creation
- A move cannot be saved without all three required fields: donor, move idea, and due date
- Created move appears immediately in the solicitor's moves list with status 'Pending'

