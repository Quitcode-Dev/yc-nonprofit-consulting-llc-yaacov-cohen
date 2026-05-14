---
id: "30386c5b-c446-4b35-8dd1-526b4c08600c"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-012"
title: "Invite Solicitor Users to an Organization"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "11"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:22:01.287038+00"
---

# US-012: Invite Solicitor Users to an Organization

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 11  
**Version:** 1

## User Story

As a **Organization Admin**, I want to invite new solicitors to my organization by entering their email address so that my fundraising team can access the platform and begin logging moves for their assigned donors.

## Acceptance Criteria

- An 'Invite Solicitor' action is accessible from the user management section of the Organization Admin view
- The invite form requires a valid email address and optionally a first and last name
- Submitting the form sends an invitation email to the specified address containing a unique signup link
- The invited solicitor appears in the user list with an 'Invited' or 'Pending' status immediately after the invitation is sent
- Attempting to invite an email address already associated with an active user in the same organization displays a validation error
- The invitation link expires after a defined period (e.g., 48 hours) and displays an appropriate message if the solicitor attempts to use an expired link
- Invited solicitors are scoped only to the inviting organization and cannot access any other organization's data upon signup

