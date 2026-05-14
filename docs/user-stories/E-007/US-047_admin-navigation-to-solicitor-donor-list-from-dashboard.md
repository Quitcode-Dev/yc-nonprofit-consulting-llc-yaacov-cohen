---
id: "5c9b4ed8-b072-4776-8796-763150176ea5"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-047"
title: "Admin Navigation to Solicitor Donor List from Dashboard"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "46"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:30:00.907443+00"
---

# US-047: Admin Navigation to Solicitor Donor List from Dashboard

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 46  
**Version:** 1

## User Story

As a **Organization Admin**, I want to click on a solicitor's name from the dashboard leaderboard and navigate directly to that solicitor's donor list so that I can quickly drill down into a specific solicitor's portfolio without manually filtering.

## Acceptance Criteria

- Each solicitor name on the leaderboard is a clickable link or button
- Clicking a solicitor's name navigates the admin to the donor list pre-filtered to show only that solicitor's assigned donors
- The filtered donor list displays all standard donor list columns (name, score, tier, assigned solicitor)
- A clear filter indicator or breadcrumb shows that the list is filtered by the selected solicitor
- Admin can clear the filter to return to the full organizational donor list
- Navigation works without full page reload or results in an acceptable single-page transition
- The destination donor list only shows donors from the admin's own organization

