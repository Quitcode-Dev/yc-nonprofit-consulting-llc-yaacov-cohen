---
id: "1daaebb0-59ec-44eb-8f8e-c942ba67e66b"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-030"
title: "CSV Donor Import with Field Mapping"
priority: "must"
effort_estimate: "L"
status: "approved"
order: "29"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:25:50.241289+00"
---

# US-030: CSV Donor Import with Field Mapping

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** L  
**Status:** approved  
**Order:** 29  
**Version:** 1

## User Story

As a **Organization Admin**, I want to upload a CSV file of donor records and map source columns to platform fields before importing so that I can bring in donor data from organizations not using Bloomerang or supplement existing synced data.

## Acceptance Criteria

- Settings → Integrations (or a dedicated Import section) contains a 'Upload CSV' button that accepts .csv files only
- After upload, the system displays a field mapping screen listing each detected CSV column alongside a dropdown of platform donor fields
- Required platform fields (first name, last name) are visually highlighted as mandatory in the mapping screen
- Admin must map at least first name and last name fields before the 'Import' button becomes enabled
- Admin can mark unmapped CSV columns as 'Skip this column' to exclude them from the import
- Clicking 'Import' processes the mapped data and displays a results summary: records created, records skipped, and errors with row-level detail
- CSV files up to 10MB and 10,000 rows are supported without timeout
- Uploading a CSV with a duplicate email address that matches an existing donor record skips the duplicate row and reports it in the error summary

