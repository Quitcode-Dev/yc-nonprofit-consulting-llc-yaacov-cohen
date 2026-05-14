---
id: "8c5689a9-7068-47b0-8045-0d7bb38f9978"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
code: "US-035"
title: "View Move History on Donor Profile"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "34"
version: "1"
created_at: "2026-05-06 11:24:29.550862+00"
updated_at: "2026-05-06 11:26:53.738672+00"
---

# US-035: View Move History on Donor Profile

**Epic:** [E-005: Moves Management & Workflow](../../epics/E-005_moves-management-workflow.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 34  
**Version:** 1

## User Story

As a **Solicitor**, I want to see a full history of all moves associated with a donor on their profile page so that I can review past outreach activities and context before planning my next interaction with that donor.

## Acceptance Criteria

- Donor profile page includes a Move History section
- Move History lists all moves (Pending and Completed) associated with that donor
- Each move entry displays: move title, assigned solicitor name, due date, status, and completion notes (if completed)
- Moves are displayed in reverse chronological order by creation date by default
- Follow-up move linkage is visible, showing which completed move triggered each follow-up
- Solicitor can only view move history for donors assigned to them; Admin can view move history for any donor in the organization
- Move History section shows an empty state message if no moves have been created for that donor

