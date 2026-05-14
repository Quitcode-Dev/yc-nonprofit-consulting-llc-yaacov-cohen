---
id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-004"
title: "Bloomerang CRM Integration & Data Import"
priority: "must"
status: "approved"
order: "3"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:05:00.097118+00"
---

# E-004: Bloomerang CRM Integration & Data Import

**Priority:** must  
**Status:** approved  
**Order:** 3  
**Version:** 1

## Description

Enable Organization Admins to connect their Bloomerang CRM account via API key and sync donor records and donation transactions directly into the platform without manual file exports. A CSV import fallback is also supported for organizations not using Bloomerang or needing to supplement synced data. This epic eliminates the fragile Zapier-based data pipeline currently in use.

## Acceptance Criteria

- Admin can enter and save a Bloomerang API key in Settings → Integrations
- System validates the API key and displays a success or error state
- On initial sync, all constituent records and donation transactions are imported at the individual constituent level
- Donation history per donor is stored and displayed on the donor profile
- Admin can trigger an on-demand re-sync at any time to pull the latest Bloomerang data
- Re-sync updates existing records and adds new records without duplicating data
- CSV import is available as a fallback, supporting field mapping during upload
- CSV import maps source columns to platform donor fields before committing data
- Import results (records created, records skipped, errors) are displayed after each import
- Bloomerang sync status (last synced timestamp, record count) is visible in Settings
- Household-level grouping is explicitly out of scope for Phase 1; all records are imported as individual constituents

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-024 | Enter and Save Bloomerang API Key | must | S | approved | [../user-stories/E-004/US-024_enter-and-save-bloomerang-api-key.md](../user-stories/E-004/US-024_enter-and-save-bloomerang-api-key.md) |
| US-025 | Validate Bloomerang API Key | must | S | approved | [../user-stories/E-004/US-025_validate-bloomerang-api-key.md](../user-stories/E-004/US-025_validate-bloomerang-api-key.md) |
| US-026 | Initial Bloomerang Data Sync — Constituent Records | must | L | approved | [../user-stories/E-004/US-026_initial-bloomerang-data-sync-constituent-records.md](../user-stories/E-004/US-026_initial-bloomerang-data-sync-constituent-records.md) |
| US-028 | On-Demand Bloomerang Re-Sync | must | M | approved | [../user-stories/E-004/US-028_on-demand-bloomerang-re-sync.md](../user-stories/E-004/US-028_on-demand-bloomerang-re-sync.md) |
| US-029 | Display Bloomerang Sync Status in Settings | must | S | approved | [../user-stories/E-004/US-029_display-bloomerang-sync-status-in-settings.md](../user-stories/E-004/US-029_display-bloomerang-sync-status-in-settings.md) |
| US-030 | CSV Donor Import with Field Mapping | must | L | approved | [../user-stories/E-004/US-030_csv-donor-import-with-field-mapping.md](../user-stories/E-004/US-030_csv-donor-import-with-field-mapping.md) |
| US-031 | View Import Results Summary | must | M | approved | [../user-stories/E-004/US-031_view-import-results-summary.md](../user-stories/E-004/US-031_view-import-results-summary.md) |
