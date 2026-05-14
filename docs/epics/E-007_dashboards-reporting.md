---
id: "4d3a3af2-a538-4827-b984-2051919261e9"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-007"
title: "Dashboards & Reporting"
priority: "must"
status: "approved"
order: "6"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:05:10.29946+00"
---

# E-007: Dashboards & Reporting

**Priority:** must  
**Status:** approved  
**Order:** 6  
**Version:** 1

## Description

Provide role-specific dashboards that surface the most actionable metrics for Solicitors, Organization Admins, and the Super Admin. Solicitor dashboards focus on their personal task queue and assigned donors, while Admin dashboards provide organizational performance metrics and solicitor accountability views.

## Acceptance Criteria

- Solicitor dashboard displays: assigned donors ranked by score, pending moves, and moves due today or overdue
- Organization Admin dashboard displays: total donors, moves needed, total moves, moves completed, pending moves, and a top solicitors leaderboard ranked by average donor score
- Top solicitors leaderboard is visible to Admins and shows each solicitor's name and average donor score
- Dashboard data reflects real-time state of the platform (no stale cache beyond acceptable limits)
- Dashboard loads in ≤ 3 seconds on a standard broadband connection
- Admin can navigate from the dashboard to any solicitor's donor list or move list
- Solicitor can click a donor from their dashboard to go directly to the donor profile
- All dashboard metrics are scoped to the current organization and do not expose data from other organizations

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-044 | Solicitor Personal Dashboard | must | M | approved | [../user-stories/E-007/US-044_solicitor-personal-dashboard.md](../user-stories/E-007/US-044_solicitor-personal-dashboard.md) |
| US-045 | Organization Admin Dashboard — Aggregate Metrics | must | M | approved | [../user-stories/E-007/US-045_organization-admin-dashboard-aggregate-metrics.md](../user-stories/E-007/US-045_organization-admin-dashboard-aggregate-metrics.md) |
| US-046 | Top Solicitors Leaderboard on Admin Dashboard | must | S | approved | [../user-stories/E-007/US-046_top-solicitors-leaderboard-on-admin-dashboard.md](../user-stories/E-007/US-046_top-solicitors-leaderboard-on-admin-dashboard.md) |
| US-047 | Admin Navigation to Solicitor Donor List from Dashboard | must | S | approved | [../user-stories/E-007/US-047_admin-navigation-to-solicitor-donor-list-from-dashboard.md](../user-stories/E-007/US-047_admin-navigation-to-solicitor-donor-list-from-dashboard.md) |
| US-049 | Real-Time Dashboard Data Refresh | must | M | approved | [../user-stories/E-007/US-049_real-time-dashboard-data-refresh.md](../user-stories/E-007/US-049_real-time-dashboard-data-refresh.md) |
| US-050 | Solicitor Dashboard Donor Click-Through to Donor Profile | must | S | approved | [../user-stories/E-007/US-050_solicitor-dashboard-donor-click-through-to-donor-profile.md](../user-stories/E-007/US-050_solicitor-dashboard-donor-click-through-to-donor-profile.md) |
| US-051 | Organization Data Isolation Across Dashboards | must | M | approved | [../user-stories/E-007/US-051_organization-data-isolation-across-dashboards.md](../user-stories/E-007/US-051_organization-data-isolation-across-dashboards.md) |
