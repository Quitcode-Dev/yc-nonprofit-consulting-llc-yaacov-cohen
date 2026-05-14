---
id: "5abcee91-91e1-4f98-8007-10eac6492184"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-015"
title: "Configure Independent Scoring and Tier Settings Per Organization"
priority: "must"
effort_estimate: "L"
status: "approved"
order: "14"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:22:16.510023+00"
---

# US-015: Configure Independent Scoring and Tier Settings Per Organization

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** L  
**Status:** approved  
**Order:** 14  
**Version:** 1

## User Story

As a **Organization Admin**, I want to configure my organization's scoring field point values, tier definitions, and move idea library independently of other organizations so that our donor scoring model and cultivation approach reflect our organization's unique characteristics without affecting any other client's configuration.

## Acceptance Criteria

- The Organization Settings page includes a scoring configuration section where checkbox fields can be enabled or disabled
- Each enabled scoring field allows the Organization Admin to set a custom point value via a numeric input
- The Organization Admin can define donor tiers by specifying a tier name and a minimum and maximum score range
- Changes to scoring field values or tier definitions in one organization are fully isolated and do not affect scoring or tier definitions in any other organization
- The Organization Admin can create, edit, and delete move ideas specific to their organization without modifying the global move ideas library
- Saved scoring configurations are persisted and correctly applied when donor scores are recalculated
- The UI prevents saving tier configurations where score ranges overlap, displaying an appropriate validation error

