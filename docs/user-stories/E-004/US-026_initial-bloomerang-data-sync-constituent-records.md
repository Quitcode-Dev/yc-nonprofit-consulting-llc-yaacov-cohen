---
id: "902822cd-cb60-432f-bd2b-1950a08b9cc9"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-026"
title: "Initial Bloomerang Data Sync — Constituent Records"
priority: "must"
effort_estimate: "L"
status: "approved"
order: "25"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:24:57.349159+00"
---

# US-026: Initial Bloomerang Data Sync — Constituent Records

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** L  
**Status:** approved  
**Order:** 25  
**Version:** 1

## User Story

As a **Organization Admin**, I want the platform to import all constituent records from Bloomerang on the initial sync so that my full donor roster is available in the platform without manual data export.

## Acceptance Criteria

- After a valid API key is saved, Admin can trigger an initial sync via a clearly labeled 'Sync Now' button in Settings → Integrations
- The sync imports all Bloomerang constituent records as individual donor records (household grouping is not applied)
- Each imported donor record captures at minimum: first name, last name, email address, and phone number where available in Bloomerang
- A progress indicator is displayed while the sync is running
- Upon completion, a summary is displayed showing total records imported and any records skipped with reasons
- Imported donor records are immediately visible in the organization's donor list
- If a constituent record is missing first name and last name, the record is skipped and listed in the import error summary
- The sync handles a minimum of 5,000 constituent records without timeout or data loss

