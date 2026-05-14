---
id: "1e04ac91-5118-4e7d-94cc-1d50e0fd663b"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
code: "US-036"
title: "Visually Identify Overdue Moves Across the Platform"
priority: "must"
effort_estimate: "S"
status: "approved"
order: "35"
version: "1"
created_at: "2026-05-06 11:24:29.550862+00"
updated_at: "2026-05-06 11:27:00.982262+00"
---

# US-036: Visually Identify Overdue Moves Across the Platform

**Epic:** [E-005: Moves Management & Workflow](../../epics/E-005_moves-management-workflow.md)  
**Priority:** must  
**Effort Estimate:** S  
**Status:** approved  
**Order:** 35  
**Version:** 1

## User Story

As a **Solicitor**, I want overdue moves to be clearly and consistently highlighted wherever moves are displayed so that I can immediately recognize which tasks are past due without manually comparing dates.

## Acceptance Criteria

- A move is considered overdue when its status is 'Pending' and its due date is strictly before today's date
- Overdue moves display a distinct visual indicator (e.g., red label, warning icon, or highlighted row) in the moves list view
- Overdue moves display the same distinct visual indicator in the calendar view
- Overdue moves display the same distinct visual indicator in the donor profile move history section
- Completed moves are never marked as overdue regardless of their due date
- The overdue state is evaluated dynamically each time the page loads, not stored as a separate status field
- Overdue indicator is accompanied by accessible contrast ratios meeting WCAG AA standards

