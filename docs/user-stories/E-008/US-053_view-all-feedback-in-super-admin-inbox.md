---
id: "16d0cada-d0d0-45a3-81a4-558d2a4b1911"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "da5af786-edba-4ca7-bc3c-91b8cf889858"
code: "US-053"
title: "View All Feedback in Super Admin Inbox"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "52"
version: "1"
created_at: "2026-05-06 11:30:19.235761+00"
updated_at: "2026-05-06 11:32:28.690595+00"
---

# US-053: View All Feedback in Super Admin Inbox

**Epic:** [E-008: In-App Feedback System](../../epics/E-008_in-app-feedback-system.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 52  
**Version:** 1

## User Story

As a **Super Admin**, I want a dedicated inbox view that displays all feedback submissions from all organizations so that I can review and manage product feedback from a single centralized location.

## Acceptance Criteria

- A Feedback Inbox menu item or section is accessible only to users with the Super Admin role
- The inbox displays all feedback submissions across all organizations in a list or table format
- Each row in the inbox displays: submission title, category, submitting user name, organization name, and submission date
- Clicking a feedback row opens a detail view showing the full description, all metadata, and any attached file
- Attached files can be downloaded or previewed from the detail view
- The inbox loads and displays up to 50 submissions per page with pagination or infinite scroll for additional records
- Non-Super Admin users receive a 403 or equivalent access-denied response if they attempt to access the feedback inbox URL directly

