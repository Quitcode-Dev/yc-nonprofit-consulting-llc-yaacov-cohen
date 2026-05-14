---
id: "7655d948-f3a8-4b39-8705-5de1a40c4070"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
code: "US-037"
title: "Super Admin creates a global Move Idea"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "36"
version: "1"
created_at: "2026-05-06 11:26:36.053241+00"
updated_at: "2026-05-06 11:27:58.273462+00"
---

# US-037: Super Admin creates a global Move Idea

**Epic:** [E-006: Move Ideas Library](../../epics/E-006_move-ideas-library.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 36  
**Version:** 1

## User Story

As a **Super Admin**, I want to create a new Move Idea in the global library with a title and category so that all organizations on the platform have access to a pre-configured set of cultivation activity templates.

## Acceptance Criteria

- A 'Create Move Idea' form is accessible from the Super Admin Move Ideas Library management screen
- The form requires a Title field (text, max 150 characters) and a Category field (selectable from a predefined list or free-text entry)
- Submitting the form with both fields populated saves the Move Idea to the global library
- The newly created Move Idea appears immediately in the global library list
- Submitting the form with Title empty displays a validation error and does not save
- Submitting the form with Category empty displays a validation error and does not save
- The created Move Idea is visible to all organizations when creating a move

