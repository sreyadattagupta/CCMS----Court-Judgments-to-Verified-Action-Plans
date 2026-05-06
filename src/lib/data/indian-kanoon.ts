// Indian Kanoon API client.
//
// Indian Kanoon (https://api.indiankanoon.org) is a real, public Indian
// court-judgment search API. It indexes Karnataka High Court judgments under
// the docsource id `khckar` and exposes JSON metadata for every doc.
//
// SAMIKSHA's production pipeline pulls judgment PDFs directly from CCMS, but
// during the hackathon prototype this client lets the CCMS frontend ingest
// real Karnataka HC judgments end-to-end. The architecture in
// ../../../samiksha/CLAUDE.md lists "eCourts services" + "Karnataka Judiciary"
// as the source systems; Indian Kanoon is the most accessible programmatic
// mirror of those for a public hackathon build.
//
// Auth: set INDIAN_KANOON_API_TOKEN. Without it, callers get null and should
// fall back to the seeded dataset in ./karnataka-hc.ts.

const ENDPOINT = 'https://api.indiankanoon.org';
// Karnataka HC docsource id used by Indian Kanoon (verified via their
// public docsource browser at /browse/khckar/).
const KHC_DOCSOURCE = 'khckar';

export interface IKDoc {
  tid: number;
  doctype: number;
  title: string;
  headline?: string;
  docsource: string;
  publishdate: string; // "YYYY-MM-DD"
  numcites?: number;
  numcitedby?: number;
  authorid?: string;
  bench?: string;
}

export interface IKSearchResponse {
  docs: IKDoc[];
  found: string;
  encodedformInput: string;
}

export interface IKDocResponse {
  tid: number;
  publishdate: string;
  title: string;
  doc: string; // HTML body of the judgment
  numcites?: number;
  citetid?: number[];
  divtype?: string;
  courtcopy?: string;
  source?: string;
}

function token(): string | null {
  const t = process.env.INDIAN_KANOON_API_TOKEN;
  return t && t.length > 0 ? t : null;
}

async function ikFetch<T>(path: string): Promise<T | null> {
  const t = token();
  if (!t) return null;
  const res = await fetch(`${ENDPOINT}${path}`, {
    method: 'POST', // Indian Kanoon's API requires POST even for reads
    headers: {
      Authorization: `Token ${t}`,
      Accept: 'application/json',
    },
    // Cached for 1h — judgment metadata is immutable once published.
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

// Karnataka HC judgments published in the last `days`, newest first.
export async function listKarnatakaHCJudgments(
  query = 'directive OR mandamus OR comply',
  days = 365,
  pageNum = 0
): Promise<IKSearchResponse | null> {
  const formInput = `${query} doctypes:${KHC_DOCSOURCE} fromdate:${dateNDaysAgo(days)} todate:today`;
  const qs = new URLSearchParams({
    formInput,
    pagenum: String(pageNum),
  });
  return ikFetch<IKSearchResponse>(`/search/?${qs.toString()}`);
}

// Fetch the full judgment HTML by Indian Kanoon tid.
export async function fetchJudgmentDoc(tid: number): Promise<IKDocResponse | null> {
  return ikFetch<IKDocResponse>(`/doc/${tid}/`);
}

function dateNDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10).replaceAll('-', '-');
}

// Best-effort parsers — Indian Kanoon titles look like:
// "Ramesh Kumar vs State Of Karnataka on 12 March, 2024"
// "Karnataka State Road Transport ... vs Union Of India on 7 May, 2025"
export function parsePartiesFromTitle(title: string): {
  petitioner: string;
  respondents: string[];
} {
  const cleaned = title.replace(/\s+on\s+\d.*/i, '').trim();
  const parts = cleaned.split(/\s+vs\.?\s+/i);
  if (parts.length < 2) {
    return { petitioner: cleaned, respondents: [] };
  }
  const petitioner = parts[0].trim();
  const respondents = parts
    .slice(1)
    .join(' vs ')
    .split(/&|,| and /i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { petitioner, respondents };
}

// Indian Kanoon titles end with "on DD Month, YYYY". Extract the disposal date.
export function parseDisposalDate(title: string, fallback: string): string {
  const m = title.match(/on\s+(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (!m) return fallback;
  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
  };
  const mm = months[m[2].toLowerCase()];
  if (!mm) return fallback;
  return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`;
}
