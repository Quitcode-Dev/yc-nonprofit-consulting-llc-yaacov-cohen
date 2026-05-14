---
id: "d891a67d-68c1-4239-8d67-b833fd0115b8"
project_id: "7ec165f4-2fa3-41b0-9546-4a26acd35cef"
epic_id: "15fb8537-1af8-4fa3-a21f-ec060f10192d"
code: "US-031"
title: "Complete a Move with Notes and Optional Follow-Up"
priority: "must"
effort_estimate: "L"
status: "approved"
order: "30"
version: "1"
created_at: "2026-05-06 11:24:29.550862+00"
updated_at: "2026-05-06 11:26:40.930053+00"
---

# US-031: Complete a Move with Notes and Optional Follow-Up

**Epic:** [E-005: Moves Management & Workflow](../../epics/E-005_moves-management-workflow.md)  
**Priority:** must  
**Effort Estimate:** L  
**Status:** approved  
**Order:** 30  
**Version:** 1

## User Story

As a **Solicitor**, I want to mark a move as complete, add completion notes, and optionally create a follow-up move in a single guided flow so that I can close out an outreach activity and immediately plan the next step without losing donor context.

## Acceptance Criteria

- A 'Complete Move' action is available on any move with status 'Pending'
- Completion flow presents a text area for completion notes (required to proceed)
- Completion flow presents an optional step to create a follow-up move
- If follow-up move is chosen, the new move form is pre-populated with the same donor and solicitor from the completed move
- Follow-up move requires the solicitor to select a Move Idea and set a due date before saving
- Upon submission, the original move status changes from 'Pending' to 'Completed' and completion notes are saved
- If a follow-up move is created, it is linked to the completed move via a follow-up move linkage field
- Completed move no longer appears in the solicitor's pending moves list
- Completion date is recorded on the move record at the time of submission

