---
id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-005"
title: "Moves Management & Workflow"
priority: "must"
status: "approved"
order: "4"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:05:03.741338+00"
---

# E-005: Moves Management & Workflow

**Priority:** must  
**Status:** approved  
**Order:** 4  
**Version:** 1

## Description

Provide Solicitors and Admins with a structured workflow for creating, scheduling, completing, and following up on outreach activities (Moves) assigned to specific donors. This epic encodes the core Moves Management methodology into the platform, replacing informal Airtable row entries with a guided, accountable workflow.

## Acceptance Criteria

- Solicitor can create a move by selecting a donor, choosing a Move Idea from the library, and setting a due date
- Move records store: title, associated donor, associated solicitor, due date, status (pending/completed), completion notes, follow-up move linkage, creation date
- Solicitor can mark a move as complete, add completion notes, and optionally create a follow-up move in a single guided flow
- Follow-up move is pre-populated with the donor context from the completed move
- Admin can view all moves across all solicitors in the organization
- Solicitor can view only their own assigned moves by default
- Calendar view displays all upcoming and overdue moves in a timeline format
- Move status transitions are: Pending → Completed
- Overdue moves (past due date, still pending) are visually distinguished
- Move history per donor is visible on the donor profile page

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-030 | Create a Move for an Assigned Donor | must | M | approved | [../user-stories/E-005/US-030_create-a-move-for-an-assigned-donor.md](../user-stories/E-005/US-030_create-a-move-for-an-assigned-donor.md) |
| US-031 | Complete a Move with Notes and Optional Follow-Up | must | L | approved | [../user-stories/E-005/US-031_complete-a-move-with-notes-and-optional-follow-up.md](../user-stories/E-005/US-031_complete-a-move-with-notes-and-optional-follow-up.md) |
| US-032 | View My Assigned Moves List | must | M | approved | [../user-stories/E-005/US-032_view-my-assigned-moves-list.md](../user-stories/E-005/US-032_view-my-assigned-moves-list.md) |
| US-033 | View All Moves Across All Solicitors as Admin | must | M | approved | [../user-stories/E-005/US-033_view-all-moves-across-all-solicitors-as-admin.md](../user-stories/E-005/US-033_view-all-moves-across-all-solicitors-as-admin.md) |
| US-034 | View Moves in a Calendar View | must | L | approved | [../user-stories/E-005/US-034_view-moves-in-a-calendar-view.md](../user-stories/E-005/US-034_view-moves-in-a-calendar-view.md) |
| US-035 | View Move History on Donor Profile | must | M | approved | [../user-stories/E-005/US-035_view-move-history-on-donor-profile.md](../user-stories/E-005/US-035_view-move-history-on-donor-profile.md) |
| US-036 | Visually Identify Overdue Moves Across the Platform | must | S | approved | [../user-stories/E-005/US-036_visually-identify-overdue-moves-across-the-platform.md](../user-stories/E-005/US-036_visually-identify-overdue-moves-across-the-platform.md) |
