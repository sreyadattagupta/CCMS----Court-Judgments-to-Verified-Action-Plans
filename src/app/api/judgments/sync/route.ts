// GET /api/judgments/sync
//
// Live-sync endpoint that pulls Karnataka High Court judgments from the
// Indian Kanoon API (the public mirror named in SAMIKSHA's source-systems
// architecture, ../../../../../samiksha/CLAUDE.md §"Reference docs"). When
// INDIAN_KANOON_API_TOKEN is unset the route returns the seeded KHC dataset
// so the dashboard remains fully functional offline.
//
// Query params:
//   q     — free-text search (default: directive-bearing keywords)
//   days  — lookback window (default: 365)
//   page  — Indian Kanoon page number (default: 0)
//   force_seed — bypass live fetch even if token is configured

import { NextRequest, NextResponse } from 'next/server';
import {
  listKarnatakaHCJudgments,
  parsePartiesFromTitle,
  parseDisposalDate,
  type IKDoc,
} from '@/lib/data/indian-kanoon';
import { KHC_JUDGMENTS } from '@/lib/data/karnataka-hc';
import type { Judgment } from '@/types/judgment';

export const revalidate = 3600;

function ikDocToJudgment(doc: IKDoc): Judgment {
  const { petitioner, respondents } = parsePartiesFromTitle(doc.title);
  const disposal = parseDisposalDate(doc.title, doc.publishdate);
  // Indian Kanoon doesn't expose CCMS case-numbers, so we synthesize one from
  // the title pattern when possible. Otherwise we fall back to the IK tid so
  // every record stays addressable.
  const numMatch = doc.title.match(/\b([A-Z.]+)\s*\.?\s*(?:No\.)?\s*(\d{1,6})[/-](\d{4})/i);
  const caseNumber = numMatch ? `${numMatch[1].toUpperCase()}/${numMatch[2]}/${numMatch[3]}` : `IK/${doc.tid}`;
  const filingYear = numMatch ? Number(numMatch[3]) : new Date(doc.publishdate).getFullYear();

  return {
    id: `ik-${doc.tid}`,
    case_number: caseNumber,
    case_title: doc.title.replace(/\s+on\s+\d.*$/i, '').trim(),
    court: 'Karnataka High Court',
    bench: doc.bench ?? 'Principal Bench, Bengaluru',
    date_of_judgment: disposal,
    pdf_url: `https://indiankanoon.org/doc/${doc.tid}/`,
    status: 'ingested',
    created_at: new Date().toISOString(),
    filing_year: filingYear,
    parties_petitioner: [petitioner],
    parties_respondent: respondents,
    departments_tagged: [], // dept router will populate after extraction
    source: 'indian_kanoon',
    source_ref: `ik:${doc.tid}`,
    languages_detected: ['en'],
    ocr_required: false,
    action_count: 0,
    verified_count: 0,
    completed_count: 0,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q') ?? 'directive OR mandamus OR comply OR compliance';
  const days = Number(url.searchParams.get('days') ?? '365');
  const page = Number(url.searchParams.get('page') ?? '0');
  const forceSeed = url.searchParams.get('force_seed') === '1';

  if (forceSeed) {
    return NextResponse.json({
      source: 'seed',
      reason: 'force_seed=1',
      count: KHC_JUDGMENTS.length,
      judgments: KHC_JUDGMENTS,
    });
  }

  const live = await listKarnatakaHCJudgments(query, days, page);
  if (!live) {
    return NextResponse.json({
      source: 'seed',
      reason: 'INDIAN_KANOON_API_TOKEN unset or upstream unavailable',
      count: KHC_JUDGMENTS.length,
      judgments: KHC_JUDGMENTS,
    });
  }

  const judgments = (live.docs ?? []).map(ikDocToJudgment);
  return NextResponse.json({
    source: 'indian_kanoon',
    upstream_found: live.found,
    count: judgments.length,
    judgments,
  });
}
