// GET /api/judgments — local CCMS view of judgments (the SAMIKSHA pipeline
// would write rows here once a case is verified and shipped to CCMS via
// stored procedure, per SPEC §1).

import { NextResponse } from 'next/server';
import { KHC_ACTIONS, KHC_JUDGMENTS } from '@/lib/data/karnataka-hc';

export const revalidate = 60;

export async function GET() {
  // Hydrate the joined action counts so the list view doesn't need
  // separate roundtrips.
  const counts: Record<string, { total: number; verified: number; completed: number }> = {};
  for (const a of KHC_ACTIONS) {
    const c = counts[a.judgment_id] ?? (counts[a.judgment_id] = { total: 0, verified: 0, completed: 0 });
    c.total += 1;
    if (a.verified_by) c.verified += 1;
    if (a.status === 'completed') c.completed += 1;
  }

  const data = KHC_JUDGMENTS.map((j) => ({
    ...j,
    action_count: counts[j.id]?.total ?? j.action_count ?? 0,
    verified_count: counts[j.id]?.verified ?? j.verified_count ?? 0,
    completed_count: counts[j.id]?.completed ?? j.completed_count ?? 0,
  }));

  return NextResponse.json({ count: data.length, judgments: data });
}
