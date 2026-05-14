---
id: "bea496fb-90ef-48b0-be0b-ab91b64aef45"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-013"
title: "View and Manage Solicitor Accounts Within an Organization"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "12"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:22:04.48056+00"
---

# US-013: View and Manage Solicitor Accounts Within an Organization

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 12  
**Version:** 1

## User Story

As a **Organization Admin**, I want to view all solicitor accounts in my organization and activate or deactivate them so that I can control who has access to our organization's data and maintain appropriate team membership.

## Acceptance Criteria

- A user management page within the Organization Admin view lists all solicitors associated with the organization
- Each solicitor entry displays: name, email address, account status (active, inactive, or invited/pending), and date added
- The Organization Admin can deactivate an active solicitor account; the deactivated solicitor immediately loses the ability to log in
- The Organization Admin can reactivate a previously deactivated solicitor account
- Deactivating a solicitor does not delete their historical move records or donor assignments
- The Organization Admin can only manage solicitors within their own organization
- A deactivated solicitor attempting to log in sees an appropriate access denied message

