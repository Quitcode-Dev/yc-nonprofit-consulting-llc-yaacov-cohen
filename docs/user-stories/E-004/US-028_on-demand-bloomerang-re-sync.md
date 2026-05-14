---
id: "e8c8e94f-cc0e-4e40-90f3-d7e78bc54b20"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-028"
title: "On-Demand Bloomerang Re-Sync"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "27"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:25:16.77823+00"
---

# US-028: On-Demand Bloomerang Re-Sync

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 27  
**Version:** 1

## User Story

As a **Organization Admin**, I want to trigger a Bloomerang re-sync at any time from Settings → Integrations so that my donor records and donation history reflect the latest data from Bloomerang without requiring a manual export.

## Acceptance Criteria

- A 'Sync Now' button is visible and clickable in Settings → Integrations after initial sync has completed
- Clicking 'Sync Now' initiates a re-sync that pulls all updated constituent and transaction records from Bloomerang since the last sync
- Existing donor records are updated with new data from Bloomerang and not duplicated
- New constituent records added in Bloomerang since the last sync are created as new donor records in the platform
- Donor records deleted in Bloomerang are not automatically removed from the platform; they remain unchanged
- Upon re-sync completion, a summary is displayed showing: records updated, records added, records skipped, and any errors
- A re-sync cannot be triggered while a sync is already in progress; the button is disabled and shows a 'Syncing…' state during an active sync

