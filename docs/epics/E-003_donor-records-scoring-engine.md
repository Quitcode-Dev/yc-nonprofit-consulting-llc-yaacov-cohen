---
id: "156472cd-c1e9-43c1-a1f5-f727cdad2698"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
code: "E-003"
title: "Donor Records & Scoring Engine"
priority: "must"
status: "approved"
order: "2"
version: "1"
created_at: "2026-05-06 10:04:30.613921+00"
updated_at: "2026-05-06 11:04:57.144373+00"
---

# E-003: Donor Records & Scoring Engine

**Priority:** must  
**Status:** approved  
**Order:** 2  
**Version:** 1

## Description

Provide a comprehensive donor record system where each donor is stored as an individual constituent with characteristic fields, donation history, a calculated score, and an assigned tier. Organization Admins can configure scoring field weights and tier thresholds via a UI, with scores recalculating automatically when settings change. This is the core data model of the platform.

## Acceptance Criteria

- Each donor record stores: first name, last name, phone, email, capacity, score, tier, assigned solicitor, and all boolean characteristic fields (Parent, Grandparent, Alumni, Board Member, Community Builder, Program Attendee, Volunteer, Donor Advised Fund, Foundation/Trustee)
- Admin can enable or disable individual scoring fields per organization
- Admin can set point values for each enabled boolean characteristic field
- Admin can define donor tiers with custom names and score ranges
- Admin can set moves-needed thresholds per score band
- Donor total score is automatically calculated as the sum of all enabled, checked characteristic field point values
- Donor tier is automatically assigned based on total score and current tier configuration
- Score and tier recalculate automatically when Admin changes scoring settings
- Admin can view the full list of donors with score, tier, and solicitor assignment
- Solicitors can view and edit characteristic fields on their assigned donors
- Donor profile displays donation history, score breakdown, characteristics, and move history

## Linked User Stories

| Code | Title | Priority | Effort | Status | File |
|---|---|---|---:|---|---|
| US-016 | Create and Store Individual Donor Record | must | M | approved | [../user-stories/E-003/US-016_create-and-store-individual-donor-record.md](../user-stories/E-003/US-016_create-and-store-individual-donor-record.md) |
| US-017 | Configure Scoring Field Weights and Enable/Disable Fields | must | M | approved | [../user-stories/E-003/US-017_configure-scoring-field-weights-and-enable-disable-fields.md](../user-stories/E-003/US-017_configure-scoring-field-weights-and-enable-disable-fields.md) |
| US-018 | Automatic Donor Score Calculation | must | M | approved | [../user-stories/E-003/US-018_automatic-donor-score-calculation.md](../user-stories/E-003/US-018_automatic-donor-score-calculation.md) |
| US-021 | Configure Moves-Needed Thresholds Per Score Band | must | S | approved | [../user-stories/E-003/US-021_configure-moves-needed-thresholds-per-score-band.md](../user-stories/E-003/US-021_configure-moves-needed-thresholds-per-score-band.md) |
| US-022 | View Full Donor List with Score, Tier, and Solicitor | must | M | approved | [../user-stories/E-003/US-022_view-full-donor-list-with-score-tier-and-solicitor.md](../user-stories/E-003/US-022_view-full-donor-list-with-score-tier-and-solicitor.md) |
| US-023 | Solicitor Views and Edits Characteristics on Assigned Donors | must | M | approved | [../user-stories/E-003/US-023_solicitor-views-and-edits-characteristics-on-assigned-donors.md](../user-stories/E-003/US-023_solicitor-views-and-edits-characteristics-on-assigned-donors.md) |
