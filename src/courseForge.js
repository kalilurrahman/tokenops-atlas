// Client for the course-forge API (the Railway service that stores the OpenMAIC-generated
// courses for every KR site). Plain JavaScript twin of the TypeScript library used by the
// handbook sites; same contract, same draft policy.

export const COURSE_API_BASE =
  (import.meta.env.VITE_COURSE_API_BASE || "").replace(/\/+$/, "") ||
  "https://course-forge-production.up.railway.app";

/** Which site's courses this deployment lists. */
export const COURSE_SITE = import.meta.env.VITE_COURSE_SITE || "tokenops";

/**
 * Drafts are shown only when the deployment opts in: nothing AI-generated reaches learners
 * before a human review, so by default a draft course is listed as "in review" and not played.
 */
export const SHOW_DRAFTS = import.meta.env.VITE_COURSE_SHOW_DRAFTS === "1";

/** @returns {{kind:"generating"}|{kind:"in_review",playable:boolean}|{kind:"approved",playable:true}} */
export function moduleAvailability(module, showDrafts = SHOW_DRAFTS) {
  if (!module.latestHtmlUrl) return { kind: "generating" };
  const approved = module.review?.verdict === "approved" || module.status === "published" || module.status === "approved";
  if (approved) return { kind: "approved", playable: true };
  return { kind: "in_review", playable: showDrafts };
}

export function moduleHtmlUrl(module, base = COURSE_API_BASE) {
  if (!module.latestHtmlUrl) return null;
  return module.latestHtmlUrl.startsWith("http") ? module.latestHtmlUrl : `${base}${module.latestHtmlUrl}`;
}

export function offlineFileName(course, module) {
  return `${course.slug}-m${module.sequence}-v${module.version}.html`;
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchCourses(site = COURSE_SITE, base = COURSE_API_BASE, fetchImpl = fetch) {
  const res = await fetchImpl(`${base}/v1/courses?site=${encodeURIComponent(site)}`, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`course API answered ${res.status}`);
  const body = await res.json();
  return Array.isArray(body.courses) ? body.courses : [];
}

/** Count an event; numbers and booleans only, never free text. Failures never surface. */
export function recordEvent(event, detail = {}, base = COURSE_API_BASE, site = COURSE_SITE, fetchImpl = fetch) {
  try {
    fetchImpl(`${base}/v1/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ site, event, ...detail }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* never surface */
  }
}
