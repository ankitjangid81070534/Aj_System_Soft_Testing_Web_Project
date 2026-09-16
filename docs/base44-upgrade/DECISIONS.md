# Decisions — 30-phase program

| ID | Decision | Reason / boundary |
|---|---|---|
| D01 | Latest attached 0–29 plan is current; execute only Phase 0 | Owner explicitly requires the exact continuation command. Old numbered reports are history, not matching new phase completions. |
| D02 | Preserve five old baseline/state files byte-for-byte in archive | Avoid deleting prior progress or silently losing old Phase 16 blockers. Existing application work remains untouched. |
| D03 | Reuse valid Base44 compose/environment manifest | Healthy source-mounted Next dev; no new stack, config or unnecessary runtime rewrite. |
| D04 | Preserve existing Supabase architecture without connecting/migrating now | The app already uses it, editing workflow does not. Public fallback boots safely; missing persistence is a blocker, never a browser-local substitute. |
| D05 | Respect previous credential deferral | No secret request, generated credential, dummy business record or auth bypass. Successful backend tests remain unavailable. |
| D06 | Documentation-only baseline, no “obvious” fixes | Builder/source/schema/voice/placement gaps are recorded for gated phases. Phase 0 forbids design/feature changes. |
| D07 | Keep the exact existing 5,000-query corpus | Count/uniqueness checked; no duplicate research or publication. Phase 26 will reassess current content mapping. |
| D08 | Test production in an isolated container /tmp copy | Keep live source/HMR and `.next` intact; copy dependencies, explicit production mode. No new app dependency. |
| D09 | Separate evidence levels | Source inventory, mock/unit, anonymous browser, authenticated persistence, field metrics and deployment are different claims. |
| D10 | Preserve optional budget field; no new pricing promise | Existing quote form already has optional budget. Wizard choices are future owner decisions. |
| D11 | No live AI without safe server/provider/knowledge boundary | AI Methods links directory is not a chatbot. Text/voice implementation remains phases 19–21; microphone policy change needs explicit scoped review. |
| D12 | Managed Git workflow only | Branch stays initial-setup; no manual commit/push, switch, merge, delete, force-push or deploy. Ask before opening a PR. |
| D13 | Keep latest master verbatim, including full phase list | `MASTER_PLAN_30_PHASES.md` is a byte-exact copy of the attachment; earlier masters remain historical. |
| D14 | Do not use old README migration claims as execution permission | Effective hosted schema/history is unknown; migration 0016 may include data effects. No automatic SQL replay. |

## Next authorization

Wait for **START NEXT PHASE SAFELY**. That permits only Phase 1 source/data/save architecture audit. It does not waive remote-access/data-mutation/migration/content-move or release approvals. If a future feature cannot persist safely through the existing backend, report the blocker.
