---
id: "d878513f-5080-49a6-a583-00bac279aa23"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "da5af786-edba-4ca7-bc3c-91b8cf889858"
code: "US-052"
title: "Store Feedback with User and Organization Metadata"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "51"
version: "1"
created_at: "2026-05-06 11:30:19.235761+00"
updated_at: "2026-05-06 11:32:23.040422+00"
---

# US-052: Store Feedback with User and Organization Metadata

**Epic:** [E-008: In-App Feedback System](../../epics/E-008_in-app-feedback-system.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 51  
**Version:** 1

## User Story

As a **system**, I want to automatically capture and store the submitting user's identity, their organization, and a timestamp alongside each feedback submission so that the Super Admin can contextualize feedback without requiring users to manually enter this information.

## Acceptance Criteria

- Each stored feedback record includes the submitting user's full name and email address as recorded in the platform
- Each stored feedback record includes the organization the submitting user belongs to
- Each stored feedback record includes a UTC timestamp of when the submission was made
- User identity and organization metadata are captured server-side and cannot be altered by the submitting user
- Feedback records from one organization are not accessible to users of any other organization
- A feedback submission by a Super Admin records their identity and flags them as Super Admin in the stored record

