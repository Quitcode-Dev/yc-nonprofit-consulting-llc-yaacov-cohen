---
id: "d0241e01-0d91-428a-bb3d-60850b704c14"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-041"
title: "Solicitor selects a Move Idea when creating a move"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "40"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:29:04.115286+00"
---

# US-041: Solicitor selects a Move Idea when creating a move

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 40  
**Version:** 1

## User Story

As a **Solicitor**, I want to select from both global and my organization's custom Move Ideas when creating a move so that I can quickly choose a pre-configured cultivation activity without manually typing move details from scratch.

## Acceptance Criteria

- The move creation form includes a Move Idea selector (dropdown or searchable list)
- The selector displays all global Move Ideas and all Move Ideas belonging to the solicitor's organization
- Global and organization-specific Move Ideas are grouped or labeled to indicate their source
- Selecting a Move Idea auto-populates the move Title field with the Move Idea's title
- The solicitor can override the auto-populated title before saving
- If no Move Ideas exist for the organization and the global library is empty, the selector displays an empty state message
- The Move Idea selector is accessible within the move creation flow without navigating away from the current workflow

