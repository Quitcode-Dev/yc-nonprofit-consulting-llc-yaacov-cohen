---
id: "9cbad5da-ff33-4137-a3b7-4602fe90df2a"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
code: "US-016"
title: "Create and Store Individual Donor Record"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "15"
version: "1"
created_at: "2026-05-06 11:21:41.01745+00"
updated_at: "2026-05-06 11:22:43.764296+00"
---

# US-016: Create and Store Individual Donor Record

**Epic:** [E-003: Donor Records & Scoring Engine](../../epics/E-003_donor-records-scoring-engine.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 15  
**Version:** 1

## User Story

As a **Organization Admin**, I want to create a donor record with all required constituent fields so that each donor is stored as a complete individual profile within my organization.

## Acceptance Criteria

- Admin can create a new donor record with fields: first name, last name, phone, email, capacity, assigned solicitor
- All nine boolean characteristic fields are present on the record: Parent, Grandparent, Alumni, Board Member, Community Builder, Program Attendee, Volunteer, Donor Advised Fund, Foundation/Trustee
- First name and last name are required fields; form cannot be submitted without them
- Email field validates proper email format and rejects invalid entries
- Phone field accepts standard phone number formats
- Capacity field accepts numeric input only
- Assigned solicitor field displays a dropdown of active solicitors within the organization
- On save, the new donor record appears in the organization's donor list
- Score and tier fields are read-only on the form and populated automatically by the scoring engine

