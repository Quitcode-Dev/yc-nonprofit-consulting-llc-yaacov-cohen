---
id: "eb148d8d-1425-4d78-ae82-cc07085c9d22"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
code: "US-033"
title: "View All Moves Across All Solicitors as Admin"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "32"
version: "1"
created_at: "2026-05-06 11:24:29.550862+00"
updated_at: "2026-05-06 11:26:47.069812+00"
---

# US-033: View All Moves Across All Solicitors as Admin

**Epic:** [E-005: Moves Management & Workflow](../../epics/E-005_moves-management-workflow.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 32  
**Version:** 1

## User Story

As a **Organization Admin**, I want to view all moves across all solicitors in my organization in a single list so that I can monitor solicitor activity, identify overdue tasks, and ensure the team is executing the moves management methodology.

## Acceptance Criteria

- Admin moves list displays moves from all solicitors within the admin's organization
- Each move row displays: move title, associated donor name, assigned solicitor name, due date, and status
- Admin can filter the list by solicitor, status (Pending/Completed), and date range
- Overdue moves (Pending and past due date) are visually distinguished in the admin view
- Admin cannot view moves belonging to a different organization
- List supports pagination or infinite scroll when more than 50 records are present
- Admin can click into any move to view full move details including completion notes

