// Backwards-compatible barrel for the legacy `DEMO_*` symbol names.
//
// The actual dataset now lives in `./data/karnataka-hc.ts` and is sourced from
// Indian Kanoon's `khckar` docsource (see `./data/indian-kanoon.ts`). Existing
// imports keep working; the `Judgment` and `ActionItem` shapes carry the
// SAMIKSHA tier/confidence fields per the SPEC.

import {
  KHC_ACTIONS,
  KHC_DEPARTMENT_STATS,
  KHC_JUDGMENTS,
} from './data/karnataka-hc';

export const DEMO_JUDGMENTS = KHC_JUDGMENTS;
export const DEMO_ACTIONS = KHC_ACTIONS;
export const DEMO_DEPARTMENT_STATS = KHC_DEPARTMENT_STATS;
