---
id: "47e15f45-abaf-4ccc-bec8-4e8743f11213"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
code: "US-022"
title: "View Full Donor List with Score, Tier, and Solicitor"
priority: "must"
effort_estimate: "M"
status: "approved"
order: "21"
version: "1"
created_at: "2026-05-06 11:21:41.01745+00"
updated_at: "2026-05-06 11:23:26.99934+00"
---

# US-022: View Full Donor List with Score, Tier, and Solicitor

**Epic:** [E-003: Donor Records & Scoring Engine](../../epics/E-003_donor-records-scoring-engine.md)  
**Priority:** must  
**Effort Estimate:** M  
**Status:** approved  
**Order:** 21  
**Version:** 1

## User Story

As a **Organization Admin**, I want to view a paginated list of all donors in my organization showing score, tier, and assigned solicitor so that I can monitor the state of the full donor portfolio at a glance.

## Acceptance Criteria

- Donor list displays columns for: full name, email, score, tier, and assigned solicitor
- List supports sorting by score, tier, and name
- List supports text-based search filtering by donor name and email
- List is paginated with a configurable page size of at least 25 and 50 records per page
- Scores and tiers displayed in the list reflect the current calculated values
- Donors with no assigned solicitor display 'Unassigned' in the solicitor column
- Admin can click any donor row to navigate to that donor's full profile

