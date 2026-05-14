---
id: "bbeee724-43f1-43db-bee7-e355f78147eb"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
code: "US-017"
title: "Configure Scoring Field Weights and Enable/Disable Fields"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "16"
version: "1"
created_at: "2026-05-06 11:21:41.01745+00"
updated_at: "2026-05-06 11:22:49.019875+00"
---

# US-017: Configure Scoring Field Weights and Enable/Disable Fields

**Epic:** [E-003: Donor Records & Scoring Engine](../../epics/E-003_donor-records-scoring-engine.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 16  
**Version:** 1

## User Story

As a **Organization Admin**, I want to enable or disable each boolean characteristic field and assign a point value to each enabled field so that the scoring engine reflects my organization's specific donor cultivation priorities.

## Acceptance Criteria

- Settings UI lists all nine boolean characteristic fields with a toggle to enable or disable each one
- Each enabled field has a numeric input for its point value; disabled fields do not accept point values
- Point values accept positive integers only; empty or negative values are rejected with an inline error message
- Admin can save the configuration; a success confirmation is displayed on save
- Disabled fields are excluded from score calculation immediately after saving
- Changes to point values or enabled/disabled status trigger automatic recalculation of all donor scores in the organization
- UI reflects the current saved configuration when the admin revisits the settings page

