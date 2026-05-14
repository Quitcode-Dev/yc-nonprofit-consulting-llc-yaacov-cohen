---
id: "d589a8d2-72c7-4bbf-aa9f-e5159e4f832f"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "4d3a3af2-a538-4827-b984-2051919261e9"
code: "US-050"
title: "Solicitor Dashboard Donor Click-Through to Donor Profile"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "49"
version: "1"
created_at: "2026-05-06 11:28:22.441017+00"
updated_at: "2026-05-06 11:30:33.499485+00"
---

# US-050: Solicitor Dashboard Donor Click-Through to Donor Profile

**Epic:** [E-007: Dashboards & Reporting](../../epics/E-007_dashboards-reporting.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 49  
**Version:** 1

## User Story

As a **Solicitor**, I want to click on a donor's name from my dashboard and be taken directly to that donor's full profile so that I can quickly access a donor's score breakdown, donation history, characteristics, and move history without additional navigation steps.

## Acceptance Criteria

- Every donor name or row displayed on the solicitor dashboard is clickable
- Clicking a donor navigates the solicitor to the donor's individual profile page
- The donor profile page includes the donor's score, tier, score breakdown, assigned solicitor, and move history
- The solicitor can only click through to donors assigned to them; no links to other solicitors' donors are present on their dashboard
- The donor profile page loads within 3 seconds of the navigation action
- A back-navigation option (browser back or breadcrumb) returns the solicitor to the dashboard without data loss

