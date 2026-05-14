---
id: "6456c255-36f7-4723-a24b-e0557d43fadf"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-049"
title: "Real-Time Dashboard Data Refresh"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "48"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:30:26.706579+00"
---

# US-049: Real-Time Dashboard Data Refresh

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 48  
**Version:** 1

## User Story

As a **Organization Admin**, I want dashboard metrics to reflect the current real-time state of the platform so that I am making decisions based on accurate, up-to-date information rather than stale cached data.

## Acceptance Criteria

- Dashboard metrics (total donors, moves completed, pending moves, moves needed) update to reflect changes made in the platform within an acceptable time window (no longer than 60 seconds after a change occurs)
- A move logged as completed by a solicitor is reflected in the 'Moves Completed' and 'Pending Moves' counts on the admin dashboard within the acceptable refresh window
- A newly added donor record is reflected in the 'Total Donors' count within the acceptable refresh window
- The solicitor leaderboard average scores update when donor scores are recalculated within the acceptable refresh window
- No manual page action (other than a standard browser refresh) is required to receive updated metrics within the acceptable window
- Documented cache TTL or refresh strategy is defined and does not exceed 60 seconds for any dashboard metric

