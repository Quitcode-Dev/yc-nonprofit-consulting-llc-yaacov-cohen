---
id: "042ccefd-934f-4f5b-ace8-625312b1554a"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-029"
title: "Display Bloomerang Sync Status in Settings"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "28"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:25:24.590169+00"
---

# US-029: Display Bloomerang Sync Status in Settings

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 28  
**Version:** 1

## User Story

As a **Organization Admin**, I want to see the Bloomerang sync status including the last synced timestamp and record count in Settings → Integrations so that I can confirm when data was last refreshed and how many records are currently synced.

## Acceptance Criteria

- Settings → Integrations displays a 'Last synced' timestamp that updates after every successful sync
- The timestamp is displayed in the organization's local time zone in a human-readable format (e.g., 'June 12, 2025 at 3:45 PM')
- Settings → Integrations displays the total number of donor records currently synced from Bloomerang
- If no sync has been performed yet, the status area displays 'Never synced' and record count shows 0
- If the most recent sync resulted in an error, the status displays 'Last sync failed' with the error timestamp
- The sync status updates within 30 seconds of a sync completing

