---
id: "f6385966-dc2b-406f-8ce3-a048b13bbb3e"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "da5af786-edba-4ca7-bc3c-91b8cf889858"
code: "US-051"
title: "Submit Categorized Feedback Form"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "50"
version: "1"
created_at: "2026-05-06 11:30:19.235761+00"
updated_at: "2026-05-06 11:32:19.20108+00"
---

# US-051: Submit Categorized Feedback Form

**Epic:** [E-008: In-App Feedback System](../../epics/E-008_in-app-feedback-system.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 50  
**Version:** 1

## User Story

As a **authenticated user**, I want to submit a feedback form with a category, title, description, and optional file attachment so that I can clearly communicate bug reports, feature requests, or questions to the platform operator.

## Acceptance Criteria

- The feedback form contains a required category field with exactly three options: Bug Report, Feature Request, Question
- The feedback form contains a required title field with a maximum of 150 characters
- The feedback form contains a required description field with a maximum of 2000 characters
- The feedback form contains an optional file attachment field accepting image files (PNG, JPG) and PDF up to 10MB
- Submitting the form without selecting a category, entering a title, or entering a description displays inline validation errors and prevents submission
- Attaching a file exceeding 10MB displays an error message and prevents submission
- A successfully submitted form closes the modal and displays a confirmation message to the user (e.g., 'Your feedback has been received')
- The confirmation message is visible for at least 3 seconds before auto-dismissing or requires manual dismissal

