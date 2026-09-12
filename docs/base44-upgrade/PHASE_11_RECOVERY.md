# Phase 11 recovery — 2026-09-12

## Scope and authorization

The owner supplied the master plan again after losing the earlier chat and asked to verify Phase 11, complete it if unfinished, otherwise proceed one phase. Recovery found a coverage gap, so this turn completes **Phase 11 only**. Phase 12 is not started. This report supplements, rather than re-runs, Phase 0 and earlier completed presentation/SEO work.

Read the current top of PHASE_STATUS.md before acting on historical gates farther down any document. The original master plan is preserved in MASTER_UPGRADE_PLAN.md. Continue only when the owner says `START NEXT PHASE SAFELY`.

## Git and old-preview investigation

- Starting branch: `system-upgrade-init`; clean starting worktree; HEAD `7fc7b45e1036b7e7ef4364e34fe40fbd7fe9f2cd`.
- Fresh `git fetch origin --prune`: `origin/main` is `f53d765`, the merge of PR #8, one merge commit ahead of HEAD with **identical tracked file content**.
- All fetched remote branch tips are ancestors of main. There is no unique branch work to combine, and no reason to mass-merge or delete branches.
- No branch switches, manual commits/pushes, force-pushes, direct main edits, merges, history rewrites or branch deletion were performed. Use the managed working-branch → reviewed PR → main flow; the platform records the resulting commit after the turn.
- The cloned source is mounted into the existing Node/Next development service. Port 3000 responds; this is not a prebuilt application image. The cause of an old display in another Base44 project/chat is **not established**. Branch equality does not prove another project's selected branch/deployment/cache is current.

## Why Phase 11 needed completion

The original corpus SHA-256 matched its evidence and had exactly 5,000 unique normalized candidates. However, its 18 route-owner clusters did not implement the master's separate 23 research groups. There were no explicit Brand, CRM or Automation query candidates and no comparison intent rows. The map also predated the existing `/disclaimer` route.

- Preserve all 5,000 IDs and language totals (en 1,680; hi 1,660; hi-Latn 1,660).
- Replace only 15 repetitive query variants with evidence-backed brand, CRM, automation and comparison candidates; add no rows and create no pages.
- Add `master_clusters` as an overlapping, semicolon-separated research taxonomy, retaining route-based `cluster` and exactly one provisional existing owner per candidate.
- Register all 23 requested groups; they are not 23 different service offerings. CRM stays with the existing ERP/CRM service and Automation with integration workflow scope; no invented CRM modules or separate automation product.
- Add the existing Disclaimer to the keyword map with a legal/navigation intent, not commercial acquisition targeting.
- Demand metrics remain blank/unknown. These are source-derived hypotheses, not measured Search Console queries. No connector or Search Console dataset is available. Native-language review and observed-intent validation remain necessary before publishing any query-derived content.

## Next-phase owner request (queued, not implemented)

In Phase 12, alongside scoped buyer-intent content improvements, add links to the **existing** `/privacy` and `/disclaimer` pages:

- Desktop: clearly visible in the top navigation without clipping the brand, existing links, Portal or main CTA.
- Mobile: inside the existing **More** navigation, not as extra bottom-dock slots.
- Preserve current tablet behavior and check the owner's 919px viewport as well as mobile and desktop.
- Reuse existing route labels, active-state/focus patterns, navigation data/CMS merging and dismissal behavior; test the actual link gestures and destinations. No new legal pages or legal copy changes requested.

This small navigation addition is explicitly authorized by the owner for the next phase; it does not authorize a general navbar redesign or new service/article routes. Existing-page improvements from PHASE_11_CONTENT_PROPOSALS.md can be evaluated in Phase 12; new-article proposals and contractual/business claims still require owner review.

## Verification and limits

Final machine-check results and current corpus digest are in `evidence/phase11-corpus-verification.json`. Fresh PASS: 5,000 normalized-unique candidates, all 23 research groups, unchanged language totals/IDs, exact source excerpts for every row, 19 valid existing owners, 32 unique mapped page primaries with 3–8 secondaries, all suggested sitemap link targets, and 32 HTTP 200/H1/preview-noindex responses. Existing regression suite: **384 tests / 44 files PASS**, typecheck PASS, lint PASS, isolated copied-source production build PASS, `git diff --check` PASS. Application source/config remain unchanged. Earlier evidence remains available in Git history and must not be represented as current browser results.

The preview browser check returned **No browser tab available**. No fresh visual, gesture, auth, admin, Google OAuth or persistence pass is claimed. Existing missing/declined integration configuration remains unchanged; no credentials were copied, generated, requested or replaced, and no remote database writes/migrations were run.

This is a documentation/research-only completion: no application source, dependencies, routes, configuration, Supabase project, RLS, data, metadata, visible content or design changes. Production deployment and field Core Web Vitals are not verified. The imported Base44 app remains unpublished; the owner-supplied company domain is not evidence of a Base44 deployment.
