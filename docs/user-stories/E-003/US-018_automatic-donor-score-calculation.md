---
id: "632dcaa6-50b9-4ce0-8ad8-e89aab34ffcb"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
code: "US-018"
title: "Automatic Donor Score Calculation"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "17"
version: "1"
created_at: "2026-05-06 11:21:41.01745+00"
updated_at: "2026-05-06 11:22:53.738503+00"
---

# US-018: Automatic Donor Score Calculation

**Epic:** [E-003: Donor Records & Scoring Engine](../../epics/E-003_donor-records-scoring-engine.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 17  
**Version:** 1

## User Story

As a **Organization Admin**, I want the system to automatically calculate each donor's total score based on their checked characteristics and current scoring settings so that scores are always accurate and require no manual calculation.

## Acceptance Criteria

- A donor's total score equals the sum of point values for all enabled characteristic fields that are checked on that donor's record
- Unchecked characteristic fields contribute zero points regardless of their configured point value
- Disabled characteristic fields contribute zero points even if checked on the donor record
- Score updates immediately when a solicitor or admin checks or unchecks a characteristic field on a donor record
- Score updates for all donors in the organization within 60 seconds when an admin changes scoring field settings
- Score is displayed as a numeric value on both the donor list view and the individual donor profile
- A score breakdown section on the donor profile lists each enabled, checked field and its point contribution

