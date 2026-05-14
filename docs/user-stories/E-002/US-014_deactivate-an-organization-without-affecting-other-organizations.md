---
id: "96d84071-cf70-4cd4-8f47-d3f32d0ba0a5"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-014"
title: "Deactivate an Organization Without Affecting Other Organizations"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "13"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:22:09.556873+00"
---

# US-014: Deactivate an Organization Without Affecting Other Organizations

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 13  
**Version:** 1

## User Story

As a **Super Admin**, I want to deactivate a client organization on the platform so that I can offboard a client while ensuring their deactivation has no impact on other organizations' data or operations.

## Acceptance Criteria

- The Super Admin can set an organization's status to 'Inactive' from the organization detail page
- Deactivating an organization prevents all users belonging to that organization from logging in
- All data (donor records, moves, settings, users) belonging to the deactivated organization is retained and not deleted
- After deactivating one organization, all other active organizations' data, user access, and settings remain completely unaffected
- The deactivated organization still appears in the Super Admin's organization list with an 'Inactive' status indicator
- The Super Admin can reactivate a deactivated organization, restoring login access for its users
- A confirmation prompt is displayed before deactivation is applied to prevent accidental action

