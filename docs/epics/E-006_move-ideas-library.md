---
id: "85067c60-45b4-4b56-902a-103a34dfbc5b"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-006"
title: "Move Ideas Library"
priority: "must"
status: "approved"
order: "5"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:05:07.728764+00"
---

# E-006: Move Ideas Library

**Priority:** must  
**Status:** approved  
**Order:** 5  
**Version:** 1

## Description

Maintain a global library of Move Ideas managed by the Super Admin that is available to all organizations as a starting point, with the ability for organizations to add their own custom Move Ideas. This library provides pre-configured cultivation activity templates so new organizations can begin tracking moves immediately upon onboarding.

## Acceptance Criteria

- Super Admin can create, edit, and delete Move Ideas in a global library
- Global Move Ideas are available to all organizations on the platform
- Each Move Idea has a title and category
- Organization Admin can create organization-specific Move Ideas visible only to their organization
- Solicitors can select from both global and their organization's Move Ideas when creating a move
- Super Admin changes to global Move Ideas are reflected across all organizations
- Deleting a global Move Idea does not delete historical moves that referenced it
- Move Ideas library is accessible from the move creation flow without leaving the workflow

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-037 | Super Admin creates a global Move Idea | must | M | approved | [../user-stories/E-006/US-037_super-admin-creates-a-global-move-idea.md](../user-stories/E-006/US-037_super-admin-creates-a-global-move-idea.md) |
| US-038 | Super Admin edits and deletes a global Move Idea | must | M | approved | [../user-stories/E-006/US-038_super-admin-edits-and-deletes-a-global-move-idea.md](../user-stories/E-006/US-038_super-admin-edits-and-deletes-a-global-move-idea.md) |
| US-039 | Organization Admin creates an organization-specific Move Idea | must | M | approved | [../user-stories/E-006/US-039_organization-admin-creates-an-organization-specific-move-idea.md](../user-stories/E-006/US-039_organization-admin-creates-an-organization-specific-move-idea.md) |
| US-040 | Organization Admin edits and deletes an organization-specific Move Idea | must | M | approved | [../user-stories/E-006/US-040_organization-admin-edits-and-deletes-an-organization-specific-move-idea.md](../user-stories/E-006/US-040_organization-admin-edits-and-deletes-an-organization-specific-move-idea.md) |
| US-041 | Solicitor selects a Move Idea when creating a move | must | M | approved | [../user-stories/E-006/US-041_solicitor-selects-a-move-idea-when-creating-a-move.md](../user-stories/E-006/US-041_solicitor-selects-a-move-idea-when-creating-a-move.md) |
| US-042 | Global Move Ideas are available to all organizations immediately upon creation | must | S | approved | [../user-stories/E-006/US-042_global-move-ideas-are-available-to-all-organizations-immediately-upon-cr.md](../user-stories/E-006/US-042_global-move-ideas-are-available-to-all-organizations-immediately-upon-cr.md) |
| US-043 | Move Ideas library is accessible inline during move creation | must | M | approved | [../user-stories/E-006/US-043_move-ideas-library-is-accessible-inline-during-move-creation.md](../user-stories/E-006/US-043_move-ideas-library-is-accessible-inline-during-move-creation.md) |
