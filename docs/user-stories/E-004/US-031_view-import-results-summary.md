---
id: "89c08b79-c1be-4f3a-868c-0120c725722c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-031"
title: "View Import Results Summary"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "30"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:26:00.446577+00"
---

# US-031: View Import Results Summary

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 30  
**Version:** 1

## User Story

As a **Organization Admin**, I want to see a detailed results summary after each CSV import or Bloomerang sync completes so that I can understand exactly what data was imported, what was skipped, and what errors occurred.

## Acceptance Criteria

- After every CSV import, a results panel is displayed showing: total rows processed, records successfully created, records skipped, and records that produced errors
- After every Bloomerang sync, a results panel is displayed showing: records created, records updated, records skipped, and errors
- Error entries include a specific reason for each failure (e.g., 'Row 14: Missing last name', 'Row 22: Duplicate email address')
- The results summary is displayed on-screen immediately after the import or sync completes without requiring a page refresh
- Admin can dismiss the results panel; a persistent log of the last 10 import/sync results is accessible in Settings → Integrations
- Each historical log entry shows the import type (CSV or Bloomerang sync), timestamp, and summary counts

