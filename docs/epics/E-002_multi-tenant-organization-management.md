---
id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-002"
title: "Multi-Tenant Organization Management"
priority: "must"
status: "approved"
order: "1"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:04:53.23501+00"
---

# E-002: Multi-Tenant Organization Management

**Priority:** must  
**Status:** approved  
**Order:** 1  
**Version:** 1

## Description

Enable the Super Admin to create and manage multiple client organizations on the platform, each operating in a fully isolated data environment. Organization Admins can manage their own settings, users, and configurations independently. This epic establishes the multi-tenant foundation required for all other epics.

## Acceptance Criteria

- Super Admin can create a new organization with name and basic details in under 5 minutes
- Each organization's donor records, moves, settings, and users are fully isolated from other organizations
- Super Admin can view a list of all organizations on the platform
- Super Admin can access any organization's admin view for support purposes
- Organization Admin can view and update their organization's profile and settings
- Organization Admin can invite, view, activate, and deactivate Solicitor accounts within their organization
- Deleting or deactivating an organization does not affect other organizations' data
- Each organization can have independent scoring configurations, tier definitions, and move idea libraries

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-008 | Create a New Client Organization | must | M | approved | [../user-stories/E-002/US-008_create-a-new-client-organization.md](../user-stories/E-002/US-008_create-a-new-client-organization.md) |
| US-009 | View All Organizations on the Platform | must | S | approved | [../user-stories/E-002/US-009_view-all-organizations-on-the-platform.md](../user-stories/E-002/US-009_view-all-organizations-on-the-platform.md) |
| US-010 | Access Any Organization's Admin View for Support | must | M | approved | [../user-stories/E-002/US-010_access-any-organizations-admin-view-for-support.md](../user-stories/E-002/US-010_access-any-organizations-admin-view-for-support.md) |
| US-011 | View and Update Organization Profile and Settings | must | S | approved | [../user-stories/E-002/US-011_view-and-update-organization-profile-and-settings.md](../user-stories/E-002/US-011_view-and-update-organization-profile-and-settings.md) |
| US-012 | Invite Solicitor Users to an Organization | must | M | approved | [../user-stories/E-002/US-012_invite-solicitor-users-to-an-organization.md](../user-stories/E-002/US-012_invite-solicitor-users-to-an-organization.md) |
| US-013 | View and Manage Solicitor Accounts Within an Organization | must | M | approved | [../user-stories/E-002/US-013_view-and-manage-solicitor-accounts-within-an-organization.md](../user-stories/E-002/US-013_view-and-manage-solicitor-accounts-within-an-organization.md) |
| US-014 | Deactivate an Organization Without Affecting Other Organizations | must | M | approved | [../user-stories/E-002/US-014_deactivate-an-organization-without-affecting-other-organizations.md](../user-stories/E-002/US-014_deactivate-an-organization-without-affecting-other-organizations.md) |
| US-015 | Configure Independent Scoring and Tier Settings Per Organization | must | L | approved | [../user-stories/E-002/US-015_configure-independent-scoring-and-tier-settings-per-organization.md](../user-stories/E-002/US-015_configure-independent-scoring-and-tier-settings-per-organization.md) |
