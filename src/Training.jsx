import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Clock, Download, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import {
  COURSE_SITE,
  fetchCourses,
  formatBytes,
  moduleAvailability,
  moduleHtmlUrl,
  offlineFileName,
  recordEvent,
} from "./courseForge";

/*
 * /training — TokenOps Atlas's interactive courses, generated in the OpenMAIC studio and
 * stored by course-forge. The lesson is one self-contained HTML file framed with
 * sandbox="allow-scripts" only: it runs its simulator and quiz but cannot read this page's
 * storage. Unreviewed exports play only when VITE_COURSE_SHOW_DRAFTS=1.
 */
export default function Training() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ kind: "loading" });
  const courseSlug = params.get("course") ?? "";
  const moduleParam = Number(params.get("module") ?? "1");

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((courses) => !cancelled && setState({ kind: "ready", courses }))
      .catch((e) => !cancelled && setState({ kind: "error", message: e instanceof Error ? e.message : String(e) }));
    return () => {
      cancelled = true;
    };
  }, []);

  const course = useMemo(
    () => (state.kind === "ready" ? state.courses.find((c) => c.slug === courseSlug) ?? null : null),
    [state, courseSlug],
  );
  const module = useMemo(
    () => course?.modules.find((m) => m.sequence === moduleParam) ?? course?.modules[0] ?? null,
    [course, moduleParam],
  );

  useEffect(() => {
    document.title = course ? `${course.title} — TokenOps Training` : "Training — TokenOps Atlas";
  }, [course]);

  useEffect(() => {
    if (course && module) recordEvent("module_opened", { courseId: course.id, moduleId: module.id, version: module.version });
  }, [course, module]);

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>{course ? course.title : "Training"}</h1>
        <p>
          {course
            ? `Module ${module?.sequence ?? 1}: ${module?.title ?? ""}${module?.durationMinutes ? ` · about ${module.durationMinutes} min` : ""}`
            : "Short interactive courses on token cost, latency and quality: one simulator, one knowledge check and a scorecard you leave with. Plays in the browser; downloadable for offline use."}
        </p>
      </div>

      {state.kind === "loading" && <p className="loading-panel" role="status">Loading courses…</p>}
      {state.kind === "error" && (
        <div className="control-surface" role="alert">
          The course service did not answer ({state.message}). The rest of the Atlas is unaffected; try again in a minute.
        </div>
      )}
      {state.kind === "ready" && !course && (
        <CourseList courses={state.courses} onOpen={(slug) => setParams({ course: slug, module: "1" })} />
      )}
      {state.kind === "ready" && course && module && (
        <Player course={course} module={module} onBack={() => setParams({})} />
      )}
    </section>
  );
}

function StatusBadge({ availability }) {
  if (availability.kind === "approved") return <span className="badge"><ShieldCheck size={12} /> Reviewed</span>;
  if (availability.kind === "generating") return <span className="badge"><Sparkles size={12} /> Generating</span>;
  return <span className="badge">Draft · in review</span>;
}

function CourseList({ courses, onOpen }) {
  if (courses.length === 0) return <p>No courses are listed for this site yet.</p>;
  return (
    <div className="section-grid two">
      {courses.map((c) => {
        const first = c.modules[0];
        const availability = first ? moduleAvailability(first) : { kind: "generating" };
        const playable = "playable" in availability && availability.playable;
        return (
          <article key={c.id} className="tile">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
              <h3 style={{ margin: 0 }}>{c.title}</h3>
              <StatusBadge availability={availability} />
            </div>
            {c.outcome && <p>{c.outcome}</p>}
            {c.primaryInteraction && <p><strong>Practice:</strong> {c.primaryInteraction}</p>}
            {c.deliverable && <p><strong>You leave with:</strong> {c.deliverable}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              {first?.durationMinutes ? <span><Clock size={14} style={{ verticalAlign: "middle" }} /> about {first.durationMinutes} min</span> : null}
              <button
                type="button"
                className="primary-action"
                style={{ marginLeft: "auto" }}
                disabled={!playable}
                onClick={() => onOpen(c.slug)}
              >
                {availability.kind === "generating" ? "Being generated" : playable ? "Start" : "In review"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Player({ course, module, onBack }) {
  const availability = moduleAvailability(module);
  const src = moduleHtmlUrl(module);
  const playable = src && "playable" in availability && availability.playable;
  return (
    <div className="stack">
      <div>
        <button type="button" className="secondary-action" onClick={onBack}><BookOpen size={16} /> All courses</button>
      </div>
      {availability.kind !== "approved" && (
        <div className="control-surface" role="note">
          Draft. This module was generated with AI assistance and has not yet been reviewed by a subject expert. Treat its
          content as a starting point, not as advice.
        </div>
      )}
      {playable ? (
        <iframe
          title={`${course.title} — ${module.title}`}
          src={src}
          sandbox="allow-scripts"
          loading="lazy"
          style={{ width: "100%", aspectRatio: "16 / 9", minHeight: "28rem", border: "1px solid var(--line)", borderRadius: 8, background: "#000" }}
        />
      ) : (
        <p>This module is not available to play yet.</p>
      )}
      <div className="panel-row" style={{ flexWrap: "wrap" }}>
        {src && playable && (
          <>
            <a
              className="download-btn"
              href={src}
              download={offlineFileName(course, module)}
              onClick={() => recordEvent("offline_download", { courseId: course.id, moduleId: module.id, version: module.version })}
            >
              <Download size={16} /> Download for offline use{module.bytes ? ` (${formatBytes(module.bytes)})` : ""}
            </a>
            <a href={src} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open full screen</a>
          </>
        )}
        {module.sha256 && <span>version {module.version} · sha256 {module.sha256.slice(0, 12)}…</span>}
        {module.review?.reviewer && module.review.reviewedOn && <span>Reviewed by {module.review.reviewer} on {module.review.reviewedOn}</span>}
        <span>Site key: {COURSE_SITE}</span>
      </div>
    </div>
  );
}
