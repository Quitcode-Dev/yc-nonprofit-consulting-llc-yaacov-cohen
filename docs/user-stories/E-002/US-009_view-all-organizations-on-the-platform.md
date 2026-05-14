---
id: "105e2b85-3915-42c7-b089-ae9742444e5f"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-009"
title: "View All Organizations on the Platform"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "8"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:21:32.003407+00"
---

# US-009: View All Organizations on the Platform

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 8  
**Version:** 1

## User Story

As a **Super Admin**, I want to view a list of all client organizations on the platform so that I have centralized visibility into all consulting clients I manage.

## Acceptance Criteria

- A dedicated 'Organizations' page is accessible from the Super Admin navigation
- The list displays each organization's name, creation date, and active/inactive status
- The list supports at least basic alphabetical sorting by organization name
- Each organization row includes a link or button to navigate to that organization's detail or admin view
- If no organizations exist, a clear empty state message is displayed
- The list loads within 3 seconds even when 100+ organizations are present

