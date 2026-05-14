---
id: "89f11fcb-3401-4f21-a9cd-164b3adc99f4"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-051"
title: "Organization Data Isolation Across Dashboards"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "50"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:31:03.736114+00"
---

# US-051: Organization Data Isolation Across Dashboards

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 50  
**Version:** 1

## User Story

As a **Organization Admin**, I want all dashboard metrics and data to be strictly scoped to my organization so that confidential donor and performance data from my organization is never exposed to users of other organizations.

## Acceptance Criteria

- No metric, donor record, solicitor name, or move displayed on the Organization Admin dashboard belongs to any organization other than the logged-in admin's organization
- No metric, donor record, or move displayed on the Solicitor dashboard belongs to any organization other than the solicitor's own organization
- API endpoints backing the dashboard enforce server-side organization scoping and do not rely solely on client-side filtering
- Manually altering query parameters or API calls to reference another organization's ID returns an authorization error (403) with no data returned
- Automated tests confirm that a user from Organization A cannot retrieve dashboard data from Organization B under any scenario

