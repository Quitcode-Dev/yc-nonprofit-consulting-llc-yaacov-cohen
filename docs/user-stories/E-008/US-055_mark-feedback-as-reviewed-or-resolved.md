---
id: "449cbe58-a35f-49ab-bac8-4b3e7e7bdca6"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "da5af786-edba-4ca7-bc3c-91b8cf889858"
code: "US-055"
title: "Mark Feedback as Reviewed or Resolved"
priority: "could"
effort_estimate: "S"
status: "in_review"
order: "54"
version: "1"
created_at: "2026-05-06 11:30:19.235761+00"
updated_at: "2026-05-06 11:33:49.536795+00"
---

# US-055: Mark Feedback as Reviewed or Resolved

**Epic:** [E-008: In-App Feedback System](../../epics/E-008_in-app-feedback-system.md)  
**Priority:** could  
**Effort Estimate:** S  
**Status:** in_review  
**Order:** 54  
**Version:** 1

## User Story

As a **Super Admin**, I want to mark individual feedback submissions as Reviewed or Resolved so that I can track which submissions have been actioned and focus on outstanding items.

## Acceptance Criteria

- Each feedback submission has a status field that defaults to 'New' upon submission
- The Super Admin can change the status of any feedback item to 'Reviewed' or 'Resolved' from the detail view
- The Super Admin can change status back from 'Resolved' to 'Reviewed' or 'New' if needed
- The updated status is reflected immediately in the inbox list view without requiring a page refresh
- The feedback inbox includes a filter option for status (New, Reviewed, Resolved, All) so the Super Admin can view only unactioned items
- Status changes are recorded with the timestamp of the change and visible in the detail view
- Submitting users do not receive any notification when the status of their feedback changes in Phase 1

