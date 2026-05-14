---
id: "1c32b737-55d3-4518-98c8-47a1080ccad9"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "da5af786-edba-4ca7-bc3c-91b8cf889858"
code: "US-054"
title: "Filter and Sort Feedback Submissions"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "53"
version: "1"
created_at: "2026-05-06 11:30:19.235761+00"
updated_at: "2026-05-06 11:32:32.39851+00"
---

# US-054: Filter and Sort Feedback Submissions

**Epic:** [E-008: In-App Feedback System](../../epics/E-008_in-app-feedback-system.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 53  
**Version:** 1

## User Story

As a **Super Admin**, I want to filter and sort feedback submissions by category, organization, and submission date so that I can prioritize and triage feedback efficiently as submission volume grows.

## Acceptance Criteria

- The feedback inbox includes a filter control for category with options: All, Bug Report, Feature Request, Question
- The feedback inbox includes a filter control for organization populated with all organizations that have submitted at least one feedback item
- The feedback inbox includes a date range filter allowing the Super Admin to specify a start date and end date
- The feedback inbox includes a sort control allowing sorting by submission date (newest first, oldest first)
- Applying any filter combination updates the displayed list without a full page reload
- When filters are active, the UI indicates which filters are applied and provides a way to clear all filters
- Filters can be combined simultaneously (e.g., category = Bug Report AND organization = TA AND date range = last 7 days)

