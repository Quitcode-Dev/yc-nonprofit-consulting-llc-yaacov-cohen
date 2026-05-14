---
id: "a8910501-dd04-4873-a210-d7d4dff7924e"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-044"
title: "Solicitor Personal Dashboard"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "43"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:29:48.474927+00"
---

# US-044: Solicitor Personal Dashboard

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 43  
**Version:** 1

## User Story

As a **Solicitor**, I want a personal dashboard that displays my assigned donors ranked by score, my pending moves, and any moves due today or overdue so that I can immediately see where to focus my attention without navigating through multiple pages.

## Acceptance Criteria

- Dashboard displays only donors assigned to the logged-in solicitor
- Donors are listed in descending order by their current calculated score
- A 'Pending Moves' section lists all moves with status 'pending' assigned to the solicitor
- Moves due today are visually distinguished (e.g., highlighted or badged) from future pending moves
- Overdue moves (due date is in the past and status is pending) are visually flagged with a distinct indicator
- Dashboard does not display donors or moves belonging to other solicitors
- Dashboard does not display data from other organizations
- Dashboard loads within 3 seconds on a standard broadband connection
- Clicking a donor row navigates directly to that donor's profile page

