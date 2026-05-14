---
id: "c0f3c247-f0d9-4d64-b646-b38dc16478ed"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-010"
title: "Access Any Organization's Admin View for Support"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "9"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:21:37.250897+00"
---

# US-010: Access Any Organization's Admin View for Support

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 9  
**Version:** 1

## User Story

As a **Super Admin**, I want to access any organization's admin view directly from the platform so that I can provide support, troubleshoot issues, and verify configurations for any client organization without requiring separate credentials.

## Acceptance Criteria

- From the organization list or detail page, the Super Admin can click an 'Access as Admin' action to enter that organization's admin view
- While in an organization's admin view, the Super Admin sees all data, settings, and users belonging to that organization
- A persistent banner or indicator is displayed when the Super Admin is viewing as an organization admin, clearly identifying the context
- The Super Admin can exit the organization admin view and return to the Super Admin global view at any time
- Actions taken by the Super Admin while in the organization admin view are correctly attributed and do not expose data from other organizations
- The Super Admin's access to the organization admin view does not require the Organization Admin's password

