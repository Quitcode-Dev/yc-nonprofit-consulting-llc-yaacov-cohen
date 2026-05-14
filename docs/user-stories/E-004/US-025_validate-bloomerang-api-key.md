---
id: "6229dc11-35a3-44c1-a08f-3c8a172020cd"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-025"
title: "Validate Bloomerang API Key"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "24"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:24:10.400144+00"
---

# US-025: Validate Bloomerang API Key

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 24  
**Version:** 1

## User Story

As a **Organization Admin**, I want the system to validate my Bloomerang API key when I save it so that I know immediately whether my key is correct and the integration is ready to use.

## Acceptance Criteria

- When a valid API key is saved, the system makes a test call to the Bloomerang API and displays a 'Connection successful' status indicator in green
- When an invalid or expired API key is saved, the system displays an 'Invalid API key — please check your credentials' error message in red
- When the Bloomerang API is unreachable (network timeout), the system displays a 'Connection failed — please try again later' error message
- The validation result (success or error) is displayed within 5 seconds of clicking 'Save'
- A failed validation does not save the key to the database
- The connection status indicator in Settings reflects the most recent validation result at all times

