---
id: "1d957718-c74d-4d26-b885-691392e1b606"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-008"
title: "Create a New Client Organization"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "7"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:21:28.401693+00"
---

# US-008: Create a New Client Organization

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 7  
**Version:** 1

## User Story

As a **Super Admin**, I want to create a new client organization by entering a name and basic details so that I can onboard a new consulting client to the platform quickly without manual configuration.

## Acceptance Criteria

- A 'Create Organization' form is accessible from the Super Admin dashboard
- The form requires at minimum: organization name (required), primary contact name (optional), and contact email (optional)
- Submitting the form with a valid organization name creates the organization and it appears immediately in the organization list
- The entire creation flow can be completed in under 5 minutes
- A duplicate organization name triggers a visible validation error and prevents creation
- The newly created organization has an isolated data environment with no donor records, users, or settings inherited from other organizations
- The Super Admin is redirected to the new organization's detail page upon successful creation

