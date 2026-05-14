---
id: "0c27a1b3-b791-4df4-b5ab-440e8a94b12c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-043"
title: "Move Ideas library is accessible inline during move creation"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "42"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:29:17.474862+00"
---

# US-043: Move Ideas library is accessible inline during move creation

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 42  
**Version:** 1

## User Story

As a **Solicitor**, I want to access and browse the Move Ideas library without leaving the move creation workflow so that I can select a move idea and return to completing the move form without losing my progress.

## Acceptance Criteria

- The Move Idea selector is embedded directly in the move creation form (e.g., inline dropdown, modal, or side panel) and does not navigate the user away from the form
- Any data already entered in the move creation form (donor selection, due date) is preserved after selecting a Move Idea
- The solicitor can search or filter Move Ideas by title or category within the selector
- Selecting a Move Idea and dismissing the selector returns the solicitor to the move creation form with the selected Move Idea applied
- The solicitor can clear a selected Move Idea and reselect a different one without losing other form data

