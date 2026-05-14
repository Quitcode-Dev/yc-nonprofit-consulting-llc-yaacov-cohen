---
id: "c7fa8a03-2971-4ffa-ba26-476d3b3a7182"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
code: "US-021"
title: "Configure Moves-Needed Thresholds Per Score Band"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "20"
version: "1"
created_at: "2026-05-06 11:21:41.01745+00"
updated_at: "2026-05-06 11:23:19.161754+00"
---

# US-021: Configure Moves-Needed Thresholds Per Score Band

**Epic:** [E-003: Donor Records & Scoring Engine](../../epics/E-003_donor-records-scoring-engine.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 20  
**Version:** 1

## User Story

As a **Organization Admin**, I want to set the number of moves needed per score band so that solicitors have clear cultivation activity targets based on each donor's score level.

## Acceptance Criteria

- Admin can define one or more score bands with a minimum score, maximum score, and a required number of moves
- Score bands accept positive integer values for both range boundaries and moves-needed count
- Admin can save, edit, and delete score band configurations
- Score bands are stored per organization and do not affect other organizations
- Saved threshold configuration is visible when the admin revisits the settings page
- Moves-needed value derived from the score band is visible on the donor profile for solicitors and admins

