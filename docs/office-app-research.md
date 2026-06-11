# Office App Competitive Research

Research snapshot: June 2026

This document tracks the modern office productivity market so Geiger Office can choose features intentionally. The goal is to compare leading office apps, group their features by category and rarity, then decide which features Geiger Office should include based on relevance, price leverage, and build cost.

## Research Goal

Geiger Office should not copy every feature from large office suites. Instead, it should identify:

- What users now expect from any office application.
- Which features are common but still required for credibility.
- Which features are rare, expensive, or locked behind higher plans.
- Which features can make Geiger Office feel relevant at a better price.
- Which features are too costly or unnecessary for the first serious version.

## Leading Office And Workspace Apps

| App | Main Offering | Market Position |
| --- | --- | --- |
| [Microsoft 365](https://www.microsoft.com/en-us/microsoft-365/business/microsoft-365-plans-and-pricing) | Word, Excel, PowerPoint, Outlook, Teams, OneDrive, SharePoint, Planner, Forms, Copilot, enterprise security and admin controls. | Most complete classic office suite. Strongest document compatibility, desktop apps, enterprise trust, and spreadsheet depth. |
| [Google Workspace](https://knowledge.workspace.google.com/admin/getting-started/editions/business-editions) | Gmail, Docs, Sheets, Slides, Drive, Meet, Calendar, Chat, Forms, Sites, Gemini, admin controls. | Best browser-first collaboration suite. Strong real-time editing, sharing, search, and team adoption. |
| [Zoho Workplace](https://www.zoho.com/workplace/pricing.html) | Mail, Calendar, WorkDrive, Writer, Sheet, Show, Cliq, Meeting, Vault, Directory, Zia AI, Trident desktop app. | Value-focused Microsoft and Google alternative. Strong for SMBs that want email, docs, chat, meetings, and storage bundled together. |
| [ONLYOFFICE Workspace](https://www.onlyoffice.com/workspace-prices) | Docs, Sheets, Slides, PDF/forms, mail, groups, talk, private rooms, desktop editors, self-hosted options. | Strong Microsoft Office file compatibility and privacy/self-hosting angle. |
| [WPS Office](https://www.wps.com/buy/) | Writer, Spreadsheet, Presentation, PDF tools, OCR, templates, e-sign, AI, cloud sync. | Low-cost Office alternative with strong PDF utilities and lightweight desktop use. |
| [LibreOffice](https://www.libreoffice.org/download/) | Writer, Calc, Impress, Draw, Base, Math, offline desktop editing, ODF and Microsoft file support. | Free and open-source offline suite. Strong cost/privacy story, weaker native cloud collaboration. |
| [Nextcloud Office](https://nextcloud.com/office/) | Self-hosted collaborative documents, spreadsheets, presentations, drawings, access control, file storage, real-time cursors through Collabora integration. | Privacy, data sovereignty, and self-hosted collaboration. Useful for teams that do not want their files in large vendor clouds. |
| [Apple iWork](https://www.apple.com/iwork/index.html) | Pages, Numbers, Keynote, templates, Apple ecosystem integration, iCloud collaboration. | Free, polished personal and creative office suite for Apple users. Less complete for cross-platform business administration. |
| [Lark](https://www.larksuite.com/en_us/plans) | Docs, messenger, meetings, calendar, approvals, Base, workflows, admin features. | Modern all-in-one work hub. Stronger in collaboration and operational workflows than classic document depth. |
| [Notion](https://www.notion.com/pricing) | Docs, wikis, databases, projects, automations, AI, connected knowledge base. | Modern workspace OS. Not a full classic Office replacement, but highly relevant for knowledge work and internal operations. |
| [Coda](https://coda.io/pricing) | Docs, tables, formulas, automations, packs/integrations, workflow apps. | Hybrid document and lightweight app builder. Useful for teams that want documents connected to structured workflows. |
| [ClickUp](https://clickup.com/pricing) | Docs, tasks, boards, calendars, dashboards, forms, project workflows, AI. | Project/work management platform that overlaps with office workflows. |
| [Quip](https://quip.com/) | Collaborative docs and spreadsheets with chat, designed around Salesforce workflows. | Niche but strong for sales and customer-facing teams inside Salesforce. |

## Feature Categories

These are the main feature groups to track for Geiger Office.

| Category | Example Features |
| --- | --- |
| Document editor | Rich text, headings, lists, tables, images, comments, templates, page layout, export to PDF/DOCX. |
| Spreadsheet | Formulas, charts, sorting, filtering, pivot tables, conditional formatting, CSV/XLSX import and export. |
| Presentation | Slides, themes, speaker notes, media, transitions, export to PPTX/PDF. |
| PDF tools | PDF viewing, PDF export, annotation, editing, merge/split, OCR, e-signature. |
| Files and storage | Cloud drive, folders, previews, sharing links, permissions, version history, recycle bin, full-text search. |
| Collaboration | Real-time editing, comments, mentions, assignments, notifications, activity history, shared workspaces. |
| Communication | Email, calendar, contacts, chat, meetings, video calls, meeting notes. |
| Tasks and workflow | Tasks, approvals, forms, simple CRM, project views, dashboards, recurring reminders. |
| Admin and security | Users, roles, groups, domains, SSO, MFA, audit logs, retention, DLP, device controls, data residency. |
| AI | Drafting, summarization, rewriting, spreadsheet help, slide generation, meeting summaries, semantic search, workflow agents. |
| Platform | Web app, desktop app, mobile app, offline mode, browser extensions, APIs, integrations, self-hosting. |

## Feature Rarity Scale

| Rarity | Meaning | Examples |
| --- | --- | --- |
| Very common | Found in almost every credible office suite. Required for basic relevance. | Docs, spreadsheets, presentations, PDF export, templates, basic sharing, cloud storage. |
| Common | Found in many serious paid office products. Expected by teams. | Real-time collaboration, comments, version history, permissions, email/calendar, chat, forms, admin console. |
| Moderately differentiating | Not universal, or often implemented with uneven quality. Can influence purchase decisions. | Offline sync, advanced spreadsheet features, PDF editing, e-signature, OCR, workflow approvals, project views, database-style docs. |
| Rare | Mostly enterprise, privacy-focused, or advanced workflow features. Good for positioning. | Self-hosting, private rooms, audit logs, DLP, eDiscovery, retention, SSO/SAML, legal hold, data residency. |
| Extremely rare | Premium, emerging, or expensive to build well. Useful for standout positioning if chosen carefully. | AI agents, cross-suite semantic search, policy-aware AI, automatic slide generation, spreadsheet intelligence, CRM/ERP live-data embedding. |

## First-Pass Product Strategy

Geiger Office should avoid trying to beat Microsoft 365 and Google Workspace feature-for-feature in the first serious version. Their depth, compatibility, and enterprise administration are hard to match directly.

The stronger opportunity is to become a useful, affordable, modern office workspace by combining the expected office basics with selected workflow features that make everyday business easier.

Recommended strategic lanes:

| Lane | Why It Matters |
| --- | --- |
| Affordable all-in-one office | Many small teams want docs, sheets, tasks, files, and collaboration without buying several separate tools. |
| Office plus operations | Documents alone are not enough. Tasks, approvals, simple CRM, forms, and dashboards can make the app more useful. |
| PDF-heavy office workflow | WPS shows there is demand for low-cost office tools with strong PDF support. |
| Privacy or self-hosting option | ONLYOFFICE and Nextcloud show that control over files can be a real differentiator. |
| AI as an assistant, not the product | AI should help users draft, summarize, organize, and search, but the core office workflow must still work without it. |

## Suggested Scoring Model

Use this scoring model when deciding whether Geiger Office should include a feature.

| Score | Description |
| --- | --- |
| User relevance | How often target users need this feature. |
| Competitive expectation | Whether users expect this feature because other office apps have it. |
| Pricing leverage | Whether competitors charge more for this feature or lock it behind higher plans. |
| Differentiation | Whether the feature makes Geiger Office meaningfully different. |
| Build complexity | How expensive or risky the feature is to build and maintain. |
| Support burden | Whether the feature creates high user support or compliance expectations. |

Possible formula:

```text
feature_priority =
  user_relevance
  + competitive_expectation
  + pricing_leverage
  + differentiation
  - build_complexity
  - support_burden
```

## Next Feature Matrix Columns

The next planning step is to convert this research into a detailed matrix.

| Column | Purpose |
| --- | --- |
| Feature | The exact function being evaluated. |
| Category | Docs, spreadsheet, PDF, collaboration, admin, AI, etc. |
| Competitors | Which leading apps offer it. |
| Rarity | Very common, common, moderately differentiating, rare, or extremely rare. |
| User value | Low, medium, high, or critical. |
| Price leverage | Whether this can help Geiger Office compete on value. |
| Build cost | Low, medium, high, or very high. |
| MVP decision | Include now, include later, avoid, or research more. |
| Notes | Context, risks, or implementation ideas. |

## Early Recommendation

For the first serious feature set, Geiger Office should likely prioritize:

- Documents with comments, sharing, export, templates, and version history.
- Spreadsheets with import/export, formulas, filtering, sorting, charts, and CSV/XLSX support.
- File workspace with folders, previews, permissions, search, and activity history.
- PDF export plus basic annotation before full PDF editing.
- Tasks, forms, and approvals as practical business workflow features.
- Simple admin: users, roles, team spaces, and permissions.
- AI for drafting, summarizing, rewriting, and search after the core workflows are stable.

Features to be careful with early:

- Full Excel macro compatibility.
- Deep enterprise compliance features.
- Full email hosting.
- Video meetings.
- Full PDF editor with OCR/e-sign/legal workflows.
- Enterprise AI agents.

Those features can be valuable, but they carry high complexity and support expectations.
