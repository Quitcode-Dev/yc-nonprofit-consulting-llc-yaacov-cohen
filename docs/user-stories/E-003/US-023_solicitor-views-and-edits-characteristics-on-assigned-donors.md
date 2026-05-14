---
id: "a21c951d-6349-4053-bbb2-78f7b0f00fb8"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
code: "US-023"
title: "Solicitor Views and Edits Characteristics on Assigned Donors"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "22"
version: "1"
created_at: "2026-05-06 11:21:41.01745+00"
updated_at: "2026-05-06 11:23:49.193377+00"
---

# US-023: Solicitor Views and Edits Characteristics on Assigned Donors

**Epic:** [E-003: Donor Records & Scoring Engine](../../epics/E-003_donor-records-scoring-engine.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 22  
**Version:** 1

## User Story

As a **Solicitor**, I want to view and edit the boolean characteristic fields on donors assigned to me so that I can keep donor profiles accurate and see how characteristics affect each donor's score.

## Acceptance Criteria

- Solicitor can only access donor profiles for donors assigned to them; attempting to access an unassigned donor returns an access-denied message
- Solicitor can view all nine boolean characteristic fields on an assigned donor's profile
- Solicitor can check or uncheck any boolean characteristic field and save the change
- Upon saving a characteristic change, the donor's score recalculates and the updated score is displayed within 5 seconds
- Solicitor cannot edit scoring field point values, tier definitions, or any other organization settings
- Donor profile visible to the solicitor includes: characteristic fields, score breakdown, tier, donation history summary, and move history
- Solicitor cannot view or edit the profiles of donors assigned to other solicitors

