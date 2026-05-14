# Product Requirements Document (PRD)
## YCNP Fundraising Intelligence Platform

---

**Document Version:** 1.0
**Status:** Draft — Pending Client Review & Sign-Off
**Prepared By:** QuitCode — Business Analysis Team
**Client:** Yaacov Cohen, YC Nonprofit Consulting (Ycnpconsulting)
**Project Type:** Greenfield Custom Web Application
**Delivery Model:** Epics & Stories
**Date Prepared:** [Current Date]

---

## Table of Contents

1. [Business Case](#1-business-case)
2. [Business Context & Goals](#2-business-context--goals)
3. [Current State Analysis](#3-current-state-analysis)
4. [Users & Stakeholders](#4-users--stakeholders)
5. [Desired Future State](#5-desired-future-state)
6. [Hypothesis](#6-hypothesis)
7. [Functional Requirements — Epics & Stories](#7-functional-requirements--epics--stories)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Technical Environment & Constraints](#9-technical-environment--constraints)
10. [Success Metrics](#10-success-metrics)
11. [Open Questions & TBDs](#11-open-questions--tbds)
12. [Appendix](#12-appendix)

---

## 1. Business Case

### 1.1 Why This Product Is Being Built

YC Nonprofit Consulting (YCNP), founded by Yaacov Cohen, has spent several years developing and validating a highly effective fundraising methodology called **Moves Management** — a structured, relationship-driven system for cultivating major donors. Implemented at Talmudical Academy of Baltimore, this system produced measurable, documented outcomes between 2020 and 2024:

- **79% increase** in total annual fundraising
- **149% growth** in the number of major donors
- **98% increase** in total giving by major donors
- **55% boost** in average gift size
- All achieved with **zero increase in staff headcount**

Yaacov currently delivers this methodology to approximately 100 client organizations — yeshivas, day schools, and small-to-mid nonprofits — through a combination of:
- A manually configured Airtable base (the "template")
- Zapier automations for workflow triggers
- One-on-one setup, training, and coaching engagements

This delivery model is effective but operationally constrained. It requires Yaacov or his team to personally configure each client's Airtable environment, import donor data from Excel, and walk clients through training — a process that cannot scale beyond the current client volume without proportional increases in time and labor.

Additionally, the current product lacks sufficiently differentiated features. Clients who understand the methodology can attempt to replicate it in their existing CRM (e.g., Bloomerang), reducing their willingness to pay for the Airtable template and ongoing support. There is no technical "moat" protecting the current offering.

**This project will design and deliver the YCNP Fundraising Intelligence Platform:** a custom-built, cloud-hosted web application that replaces the Airtable-plus-Zapier architecture with a purpose-built, multi-tenant SaaS product. The platform will serve two converging strategic goals:

1. **Deepen value for existing YCNP clients** by providing a premium, AI-enhanced tool that makes the YCNP engagement irresistible and difficult to replicate independently.
2. **Expand total addressable market** by launching a standalone subscription product accessible to the broader nonprofit fundraising market — far beyond the ~100 organizations Yaacov has directly worked with.

### 1.2 The Market Opportunity

The U.S. nonprofit sector comprises over 1.5 million registered organizations. Major donor relationship management is a universal need across virtually all of them. Yet no mainstream CRM — including Bloomerang, DonorPerfect, Little Green Light, or Salesforce NPSP — provides purpose-built Moves Management functionality with AI-assisted donor research, meeting preparation, and communication drafting. Wealth screening tools such as DonorSearch address a narrower use case (financial capacity screening) and do not provide relationship-management workflow, contextual preparation, or AI-driven communication support.

This creates a clear, defensible product gap — a focused Moves Management platform with integrated AI enrichment and workflow intelligence — which the YCNP Fundraising Intelligence Platform is uniquely positioned to fill.

---

## 2. Business Context & Goals

### 2.1 Goals & Objectives

| ID | Goal | Measurable Outcome | Phase |
|---|---|---|---|
| G1 | Deliver a functional MVP of the YCNP Fundraising Intelligence Platform | Working web application with core donor management and all four AI features deployed and accessible to initial pilot users | Phase 1 |
| G2 | Replicate and improve upon current Airtable template functionality | All features currently available in the Airtable base are available in the new platform with equal or superior usability, validated by Yaacov during UAT | Phase 1 |
| G3 | Launch AI-assisted donor enrichment capability | Users can trigger on-demand donor research from a donor record and receive a structured enrichment report within 60 seconds, per pilot testing | Phase 1 |
| G4 | Deliver AI-powered meeting preparation, move planning, and communication drafting | Minimum four AI-assisted workflow actions operational and tested at MVP launch | Phase 1 |
| G5 | Enable multi-tenant SaaS architecture | Multiple independent organizations can register, operate, and be managed separately with zero data cross-contamination | Phase 1 |
| G6 | Reduce client onboarding effort | New client setup time reduced from estimated [TBD — current hours per client] to self-service or near-self-service onboarding completable in under 30 minutes | Phase 1 |
| G7 | Establish foundation for broader market distribution | Platform architecture supports public registration and subscription management, enabling outbound SEO and SaaS marketing efforts | Phase 1–2 |
| G8 | Integrate with Bloomerang CRM | Optional API-based import or live sync of donor giving history from Bloomerang | Phase 2 |
| G9 | Launch subscription and billing automation | Stripe-based tiered billing operational, supporting self-serve sign-up and recurring revenue | Phase 2 |

### 2.2 The Strategic "Why"

| Driver | Description |
|---|---|
| **Scalability** | Manual Airtable setup cannot scale. A SaaS product allows Yaacov to onboard unlimited clients without proportional labor cost. |
| **Defensibility** | AI-powered enrichment and workflow features cannot be self-implemented by clients in Bloomerang or a generic CRM, creating a durable product moat. |
| **Revenue Expansion** | Moving from a one-time template fee to recurring SaaS subscription revenue generates predictable, compounding income. |
| **Market Reach** | A standalone web product accessible via SEO and direct marketing expands the addressable market from ~100 YCNP alumni to any nonprofit development team in the U.S. |
| **IP Monetization** | The platform directly monetizes Yaacov's validated methodology and domain expertise at scale, consistent with a product-led growth strategy. |

### 2.3 Key Performance Indicators (KPIs)

TBD

### 2.4 Definition of Success — Phase 1

Phase 1 (MVP) is considered successful when **all of the following conditions are met**:

- [ ] The platform is live and accessible (invitation-gated or public) in a cloud-hosted production environment
- [ ] At least **3 pilot client organizations** have successfully onboarded, imported donor data, and created moves without direct intervention from Yaacov or the QuitCode team
- [ ] At least one of **four AI-assisted features** (Enrichment, Meeting Prep, Move Planning, Communication Drafter) are operational and return usable output in pilot testing
- [ ] Yaacov has signed off on UAT, confirming all Airtable template features are replicated at equal or superior quality
- [ ] No critical data isolation failure (one tenant's data visible to another) has been identified during QA
- [ ] User onboarding documentation exists and is sufficient for a new client to complete setup independently

---

## 3. Current State Analysis

### 3.1 How Things Work Today — Manual Processes

The current delivery workflow for each new YCNP client proceeds as follows:

```
Step 1: Client engagement agreed → Yaacov sends Excel template to client
Step 2: Client fills out Excel template with donor names, contact info,
        giving history summary, assigned fundraiser, scores
Step 3: Yaacov (or team) manually imports Excel data into Airtable base
Step 4: Yaacov configures the Airtable base for the client's structure
        (fundraiser names, scoring thresholds, move categories)
Step 5: Yaacov shares Airtable base with client; client copies it
        into their own Airtable account
Step 6: Client shares base back with Yaacov (read-only or edit access)
        for support and troubleshooting
Step 7: Yaacov conducts training session(s) on how to use the interface
Step 8: Client uses Airtable interface for ongoing donor management
Step 9: Annually — client exports donors from Bloomerang, re-scores,
        re-imports into Airtable; previous year's low-score records deleted
```

**Donor Enrichment (Yaacov's Personal TA Instance — Not Yet Available to Clients):**
```
Trigger: New donation enters Bloomerang
→ Zapier automation fires
→ Web serch for biographical/social data enrichment
→ Aggregates data from multiple sources
→ Sends structured enrichment email to Yaacov
(This is NOT currently available to consulting clients — it is TA-specific)
```

### 3.2 Software Currently In Use

| Tool | Purpose | Limitations |
|---|---|---|
| **Airtable** | Donor database, move tracking, interface layer | Requires per-client manual setup; clients need own subscription; no native AI features; limited scalability for AI enrichment; updates to template don't propagate to existing clients |
| **Zapier** | Automation (enrichment trigger, Bloomerang sync) | Per-task pricing; not included in client product; difficult to scale; Zapier limitations noted (Make.com recommended for complex scenarios) |
| **Bloomerang** | Primary CRM for donation tracking, acknowledgments, pledges | No native Moves Management; wealth screening (DonorSearch) available as paid add-on but limited to wealth indicators only; clients use separately from Airtable |
| **Excel / Google Sheets** | Donor data template for client onboarding import | Manual, error-prone; requires Yaacov to import |
| **DonorSearch (via Bloomerang)** | Wealth screening add-on | Expensive; wealth-data only; no relationship/social enrichment; API availability and pricing [TBD] |
| **People Data Labs API** | Biographical and social enrichment (TA Zapier build) | Currently TA-only; not offered to clients; requires Zapier intermediary |
| **Email (Gmail)** | Client communication; enrichment report delivery | Manual; no structured capture |

### 3.3 Top 3 Pain Points

**Pain Point 1: Unscalable Manual Onboarding**
Every new client requires Yaacov to personally configure an Airtable base, handle data import from Excel, and conduct training. This creates a hard ceiling on how many clients can be served simultaneously and how quickly new clients can be activated. The setup labor cost erodes margin and limits growth.

*User Quote (paraphrased from call):* "I charge a lot of money to set it up for them… I want to make the product irresistible."

**Pain Point 2: No Defensible Technical Differentiation**
The Airtable template replicates the Moves Management methodology but provides no features that clients cannot theoretically replicate in their existing CRM. Clients sometimes push back on purchasing the template, reasoning they can "try to set it up in my own database first." The product lacks a technical moat that makes self-implementation clearly impractical.

*User Quote (paraphrased from call):* "A lot of my clients will say to me… maybe I'll try to set it up in my own database first. If I could add some features that I know for sure they're not going to do in their own database, it just makes the whole package so much more enticing."

**Pain Point 3: Limited Total Addressable Market**
The current product can only be sold to organizations already engaged with YCNP's consulting or Bootcamp. This restricts the market to Yaacov's direct network — approximately 100 organizations to date. The AI-enrichment and Moves Management features described have broader market relevance that cannot be captured through the current Airtable model.

*User Quote (paraphrased from call):* "My whole customer base is basically my own clients… I feel that these tools that I'm describing are stuff that doesn't exist in the fundraising world."

---

## 4. Users & Stakeholders

### 4.1 Primary Users — Personas

---

**Persona 1: The Development Director / Fundraiser**
*"I need to know who to call, what to say, and what to do next — without spending hours on research."*

| Attribute | Detail |
|---|---|
| **Role** | Director of Development, Major Gifts Officer, or Staff Fundraiser at a yeshiva, day school, or small nonprofit |
| **Organization size** | 1–5 person development team |
| **Technical proficiency** | Low-to-moderate; comfortable with Bloomerang, email, spreadsheets; not a power user of databases or automation tools |
| **Primary goals** | Manage relationships with 30–150 major donors; know what move to make next; prepare effectively for donor meetings; follow up consistently |
| **Key frustrations** | Forgetting to follow up; not knowing enough about a donor before a meeting; spending time on research instead of relationship-building; no clear view of "who do I call today" |
| **What they need from the platform** | A clean, actionable daily view of moves to complete; a single click to get donor background before a meeting; AI-drafted emails that sound personal; a suggested next move after every interaction |
| **Usage frequency** | Daily to several times per week |
| **Device preference** | Desktop browser (primary); mobile-responsive (secondary) |

---

**Persona 2: The Self-Serve SaaS User (Future/Phase 2)**
*"I've heard about Moves Management and want to try it for my organization — without hiring a consultant."*

| Attribute | Detail |
|---|---|
| **Role** | Development staff or ED at a nonprofit not currently engaged with YCNP |
| **Discovery channel** | SEO, word-of-mouth, Major Donor Bootcamp content marketing |
| **Technical proficiency** | Moderate; capable of self-service onboarding with good UX and documentation |
| **Primary goals** | Implement a structured major donor system; access AI-powered enrichment and planning tools |
| **Key frustrations** | Existing CRMs don't provide Moves Management; wealth screening tools are too expensive and only provide financial data; no AI-assisted workflow exists in their current stack |
| **What they need from the platform** | Self-service registration and onboarding; CSV upload for donor import; full AI feature access without a consulting engagement |
| **Usage frequency** | Daily to weekly |
| **Phase** | Phase 2 primary target; Phase 1 architecture must support |

---

**Persona 3: Platform Administrator & Consulting Advisor**
*"I need to onboard clients quickly, monitor their usage, and ensure the platform makes my consulting engagements indispensable."*

| Attribute | Detail |
|---|---|
| **Role** | Platform owner, YCNP Founder, super-admin |
| **Primary goals** | Onboard client organizations without manual setup; monitor organization usage; manage access and billing; iterate on the product based on client feedback |
| **What they need from the platform** | Admin panel to create/manage organizations, view usage statistics, manage user access; ability to push updates to all tenants simultaneously (unlike the Airtable model) |
| **Usage frequency** | Several times per week (admin tasks); as needed for client support |

### 4.2 Decision Maker

**Yaacov Cohen** — Project Sponsor and Product Owner — is the sole decision-maker for scope, prioritization, budget, and launch readiness. All scope changes, feature decisions, and launch approvals require his explicit sign-off. Contact: ycnpconsulting@gmail.com / (443) 204-1822 (WhatsApp).

### 4.3 Stakeholders Summary

| Stakeholder | Role | Influence | Communication Preference |
|---|---|---|---|
| Yaacov Cohen | Project Sponsor / Product Owner | High — final authority | WhatsApp, Email, Video Call |
| Roman Sydorak (QuitCode) | Technical Lead / Lead Developer | High — technical decisions | Internal |
| QuitCode PM | Project Manager | Medium — delivery coordination | [TBD] |
| QuitCode BA | Business Analyst | Medium — requirements | [TBD] |
| YCNP Pilot Clients (3–5 orgs) | UAT Participants / Early Adopters | Medium — product validation | Via Yaacov |
| YCNP Bootcamp Alumni | Future SaaS Users | Low (Phase 1) / High (Phase 2) | Marketing channels |

---

## 5. Desired Future State

### 5.1 Ideal Process — After the Platform Is Built

```
NEW CLIENT ONBOARDING (Target: < 30 minutes, fully self-service)
──────────────────────────────────────────────────────────────
Step 1: Yaacov sends client an invitation link (or client self-registers)
Step 2: Client creates organization account, adds team members with roles
Step 3: Client uploads CSV of donors (mapped to standard field template)
Step 4: Platform validates, imports, and displays donor records immediately
Step 5: Client explores Move Ideas Library, assigns initial moves to donors
Step 6: Onboarding guide walks client through first enrichment and first move
→ Client is operational. No Yaacov involvement required.

DAILY FUNDRAISER WORKFLOW
──────────────────────────────────────────────────────────────
Morning: Fundraiser logs in → Dashboard shows today's scheduled moves
          and upcoming donor interactions
Before Meeting: Fundraiser clicks "Prepare for Meeting" on donor record
                → Receives structured brief: wealth context, giving history,
                   relationship stage, suggested talking points, last interaction
During/After: Fundraiser marks move complete, adds notes
              → AI offers structured debrief summary and suggested next move
Communication: Fundraiser clicks "Draft Communication" → selects type
               (email, thank-you, ask) → receives personalized draft
               using donor-specific context

ANNUAL RESCORING CYCLE
──────────────────────────────────────────────────────────────
Client exports updated donor list from Bloomerang (CSV)
→ Re-uploads to platform with new scoring data
→ Platform updates scores, flags donors who dropped below threshold
→ Client archives low-score donors with one click
→ New high-score donors enriched automatically (or on demand)

PLATFORM ADMINISTRATION (Yaacov)
──────────────────────────────────────────────────────────────
Yaacov logs into admin panel
→ Views all active organizations, usage metrics, enrichment credit usage
→ Manages billing status and user access
→ Deploys platform updates to all tenants simultaneously
```

---

## 6. Hypothesis

### 6.1 Pain Points Addressed

| Pain Point | How the Platform Addresses It |
|---|---|
| Manual, unscalable client onboarding | Self-service registration + CSV import eliminates per-client setup labor entirely |
| No technical defensibility / clients self-implementing | AI enrichment, meeting prep, move planning, and communication drafting are features clients cannot replicate in Bloomerang or a generic CRM |
| Market ceiling at ~100 organizations | Web-based SaaS with self-serve onboarding and SEO discoverability enables access to the full nonprofit fundraising market (1.5M+ orgs) |
| Donor research is time-consuming and incomplete | One-click enrichment aggregates biographical,