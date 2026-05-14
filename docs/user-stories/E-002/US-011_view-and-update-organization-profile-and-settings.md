---
id: "d66e33f2-e937-4733-90ca-c97987108caa"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "694ce9cc-faa9-4c02-aec1-5986d78108c4"
code: "US-011"
title: "View and Update Organization Profile and Settings"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "10"
version: "1"
created_at: "2026-05-06 11:20:39.894166+00"
updated_at: "2026-05-06 11:21:56.564465+00"
---

# US-011: View and Update Organization Profile and Settings

**Epic:** [E-002: Multi-Tenant Organization Management](../../epics/E-002_multi-tenant-organization-management.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 10  
**Version:** 1

## User Story

As a **Organization Admin**, I want to view and update my organization's profile and settings so that I can keep our organization's information current and configure the platform to match our needs.

## Acceptance Criteria

- An 'Organization Settings' page is accessible from the Organization Admin navigation
- The settings page displays the organization name and any editable profile fields (e.g., contact name, contact email)
- The Organization Admin can edit and save changes to the organization name and profile fields
- A success confirmation message is displayed upon saving changes
- Invalid or empty required fields (e.g., blank organization name) trigger inline validation errors and prevent saving
- Changes to one organization's profile do not affect any other organization's data or settings
- The Organization Admin cannot access settings or data belonging to any other organization

