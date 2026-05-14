---
id: "42644a95-9220-4e3a-97b0-37fc28122c13"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
code: "US-032"
title: "View My Assigned Moves List"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "31"
version: "1"
created_at: "2026-05-06 11:24:29.550862+00"
updated_at: "2026-05-06 11:26:44.017234+00"
---

# US-032: View My Assigned Moves List

**Epic:** [E-005: Moves Management & Workflow](../../epics/E-005_moves-management-workflow.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 31  
**Version:** 1

## User Story

As a **Solicitor**, I want to see a list of only my assigned moves filtered by status so that I can quickly identify which outreach tasks need my attention without seeing other solicitors' work.

## Acceptance Criteria

- Solicitor's moves list displays only moves where the assigned solicitor matches the logged-in user
- List displays move title, associated donor name, due date, and status for each move
- Solicitor can filter the list by status: All, Pending, Completed
- Overdue moves (status = Pending and due date is in the past) are visually distinguished from non-overdue pending moves (e.g., different color, icon, or label)
- List is sortable by due date (ascending/descending)
- Solicitor cannot view or access moves assigned to other solicitors from this view
- Empty state message is shown when no moves match the selected filter

