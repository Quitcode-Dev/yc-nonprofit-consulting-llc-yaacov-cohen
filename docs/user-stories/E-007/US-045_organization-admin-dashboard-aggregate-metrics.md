---
id: "e4a5baf3-0eb1-4549-b1f5-3415b9620103"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-045"
title: "Organization Admin Dashboard — Aggregate Metrics"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "44"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:29:52.217551+00"
---

# US-045: Organization Admin Dashboard — Aggregate Metrics

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 44  
**Version:** 1

## User Story

As a **Organization Admin**, I want a dashboard showing aggregate organizational metrics including total donors, moves needed, total moves, moves completed, and pending moves so that I can monitor my organization's overall fundraising activity and progress at a glance.

## Acceptance Criteria

- Dashboard displays a 'Total Donors' count reflecting all donor records in the organization
- Dashboard displays a 'Moves Needed' count based on the organization's configured moves-needed thresholds by score band
- Dashboard displays a 'Total Moves' count reflecting all moves ever created in the organization
- Dashboard displays a 'Moves Completed' count reflecting all moves with status 'completed' in the organization
- Dashboard displays a 'Pending Moves' count reflecting all moves with status 'pending' in the organization
- All metric counts are scoped exclusively to the logged-in admin's organization
- Metrics reflect the real-time state of the platform with no stale data beyond acceptable cache limits
- Dashboard loads within 3 seconds on a standard broadband connection
- Each metric card displays its label and numeric value clearly

