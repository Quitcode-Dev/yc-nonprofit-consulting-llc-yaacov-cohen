---
id: "fb69b668-d072-4136-928f-cca789098cf5"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "032e39b1-b046-459a-ace5-6df2c2ccdce8"
code: "US-024"
title: "Enter and Save Bloomerang API Key"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "23"
version: "1"
created_at: "2026-05-06 11:23:07.94157+00"
updated_at: "2026-05-06 11:24:02.877683+00"
---

# US-024: Enter and Save Bloomerang API Key

**Epic:** [E-004: Bloomerang CRM Integration & Data Import](../../epics/E-004_bloomerang-crm-integration-data-import.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 23  
**Version:** 1

## User Story

As a **Organization Admin**, I want to enter and save my Bloomerang API key in Settings → Integrations so that the platform can authenticate with my Bloomerang account and access my donor data.

## Acceptance Criteria

- Settings → Integrations page contains a clearly labeled 'Bloomerang API Key' input field
- The input field masks the entered key after saving (displays as asterisks or truncated)
- A 'Save' button is present and enabled only when the input field is non-empty
- Clicking 'Save' persists the API key securely and does not expose it in the UI or network response payload
- A success confirmation message is displayed immediately after a valid key is saved
- Admin can update the saved key by entering a new value and clicking 'Save' again
- The previously saved key cannot be retrieved in plain text via the UI

