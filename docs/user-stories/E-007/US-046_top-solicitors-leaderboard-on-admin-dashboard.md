---
id: "8d6f5c5c-6cb5-4138-ace9-53055cf63080"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-046"
title: "Top Solicitors Leaderboard on Admin Dashboard"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "45"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:29:57.448039+00"
---

# US-046: Top Solicitors Leaderboard on Admin Dashboard

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 45  
**Version:** 1

## User Story

As a **Organization Admin**, I want a top solicitors leaderboard on my dashboard ranked by each solicitor's average donor score so that I can identify high-performing solicitors and those who may need additional support or coaching.

## Acceptance Criteria

- Leaderboard is visible only to Organization Admins and Super Admins, not to Solicitors
- Leaderboard lists all active solicitors in the organization ranked in descending order by their average donor score
- Each leaderboard row displays the solicitor's full name and their average donor score
- Average donor score is calculated as the mean score of all donors assigned to that solicitor
- Solicitors with no assigned donors are either excluded from the leaderboard or displayed at the bottom with a score of 0 or N/A
- Leaderboard data is scoped to the current organization only and does not include solicitors from other organizations
- Leaderboard is visible as part of the Admin dashboard and loads within the overall 3-second page load requirement

