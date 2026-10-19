/* ============================================================================
   AAR — Contact & Community Ingestion Controller
   Handles direct developer feedback and community catalog contributions.
   ========================================================================= */

import { submitContribution, ApiError } from "./api.js?v=4";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const TEMPLATES = {
  ADD_WORK: {
    contribution_type: "ADD_WORK",
    media_type: "anime",
    title: "Example Title (e.g. Dennou Coil Special)",
    alt_titles: ["Denno Coil Special", "Coil A Circle of Children OVA"],
    suggested_tags: ["Sci-Fi", "Mystery", "Augmented Reality"],
    reference_url: "https://myanimelist.net/anime/...",
    custom_description: "A missing special episode or short expanding the AR glasses world.",
    synopsis_or_note: "Broadcast in 2007; currently missing from primary index.",
    submitter_id: "anonymous"
  },
  ADD_ALIAS: {
    contribution_type: "ADD_ALIAS",
    media_type: "anime",
    title: "Cowboy Bebop",
    target_work_id: "work:anime:mal_1_al_1",
    alt_titles: ["Kauboi Bibappu", "Space Cowboy", "Cowboy Bebop The Movie"],
    synopsis_or_note: "Adding localized and romanized alternative names.",
    submitter_id: "anonymous"
  },
  EDIT_METADATA: {
    contribution_type: "EDIT_METADATA",
    media_type: "visual_novel",
    title: "Steins;Gate",
    target_work_id: "work:visual_novel:vndb_v2002",
    suggested_tags: ["Time Travel", "Psychological", "Sci-Fi", "Science Adventure"],
    reference_url: "https://vndb.org/v2002",
    synopsis_or_note: "Updating primary setting tags and creator attribution.",
    submitter_id: "anonymous"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initModeToggle();
  initFormMode();
  initJsonMode();
});

/* ---- 1. Segmented Mode Toggle -------------------------------------------- */

function initModeToggle() {
  const btnForm = $("#btn-mode-form");
  const btnJson = $("#btn-mode-json");
  const formWrap = $("#contrib-form");
  const jsonWrap = $("#contrib-json-wrap");

  if (!btnForm || !btnJson) return;

  btnForm.addEventListener("click", () => {
    btnForm.classList.add("is-active");
    btnForm.setAttribute("aria-selected", "true");
    btnJson.classList.remove("is-active");
    btnJson.setAttribute("aria-selected", "false");

    if (formWrap) formWrap.style.display = "block";
    if (jsonWrap) jsonWrap.style.display = "none";
  });

  btnJson.addEventListener("click", () => {
    btnJson.classList.add("is-active");
    btnJson.setAttribute("aria-selected", "true");
    btnForm.classList.remove("is-active");
    btnForm.setAttribute("aria-selected", "false");

    if (jsonWrap) jsonWrap.style.display = "block";
    if (formWrap) formWrap.style.display = "none";
  });
}

/* ---- 2. Form Mode -------------------------------------------------------- */

function initFormMode() {
  const form = $("#contrib-form");
  const typeSelect = $("#contrib-type");
  const targetIdRow = $("#contrib-target-id-row");
  const submitBtn = $("#btn-submit-form");

  if (!form) return;

  if (typeSelect && targetIdRow) {
    typeSelect.addEventListener("change", () => {
      const val = typeSelect.value;
      if (val === "ADD_ALIAS" || val === "EDIT_METADATA") {
        targetIdRow.style.display = "block";
      } else {
        targetIdRow.style.display = "none";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titleInput = $("#contrib-title");
    const title = titleInput ? titleInput.value.trim() : "";
    if (!title) {
      showOutcome({
        status: "ERROR",
        message: "Work title is required. Please provide a title."
      });
      if (titleInput) titleInput.focus();
      return;
    }

    const targetId = $("#contrib-target-id")?.value.trim() || null;
    const altTitles = $("#contrib-alt-titles")?.value.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) || [];
    const tags = $("#contrib-tags")?.value.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) || [];
    const refUrl = $("#contrib-url")?.value.trim() || null;
    const desc = $("#contrib-desc")?.value.trim() || null;
    const note = $("#contrib-note")?.value.trim() || null;
    const submitter = $("#contrib-submitter")?.value.trim() || "anonymous";

    const payload = {
      contribution_type: typeSelect?.value || "ADD_WORK",
      media_type: $("#contrib-media")?.value || "anime",
      title,
      target_work_id: targetId,
      alt_titles: altTitles,
      suggested_tags: tags,
      reference_url: refUrl,
      custom_description: desc,
      synopsis_or_note: note,
      submitter_id: submitter,
    };

    setLoading(submitBtn, true);
    try {
      const res = await submitContribution(payload);
      showOutcome(res);
      form.reset();
      if (targetIdRow) targetIdRow.style.display = "none";
    } catch (err) {
      showOutcome({
        status: "ERROR",
        message: err.message || "Failed to submit contribution. Check network connectivity."
      });
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ---- 3. JSON Upload & Editor Mode ---------------------------------------- */

function initJsonMode() {
  const editor = $("#contrib-json-editor");
  const dropzone = $("#contrib-dropzone");
  const fileInput = $("#contrib-file-input");
  const statusEl = $("#contrib-json-status");
  const submitBtn = $("#btn-submit-json");
  const formatBtn = $("#btn-format-json");
  const tmplBtns = $$("[data-tmpl]");

  if (!editor) return;

  editor.value = JSON.stringify(TEMPLATES.ADD_WORK, null, 2);
  validateJson();

  editor.addEventListener("input", () => validateJson());

  tmplBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-tmpl");
      if (TEMPLATES[type]) {
        editor.value = JSON.stringify(TEMPLATES[type], null, 2);
        validateJson();
      }
    });
  });

  if (formatBtn) {
    formatBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(editor.value);
        editor.value = JSON.stringify(parsed, null, 2);
        validateJson();
      } catch (_) {}
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    ["dragenter", "dragover"].forEach((event) => {
      dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        dropzone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach((event) => {
      dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-dragover");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) handleFile(fileInput.files[0]);
    });
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        try {
          const parsed = JSON.parse(text);
          editor.value = JSON.stringify(parsed, null, 2);
        } catch (_) {
          editor.value = text;
        }
        validateJson();
      }
    };
    reader.readAsText(file);
  }

  function validateJson() {
    if (!statusEl) return null;
    const text = editor.value.trim();
    if (!text) {
      statusEl.className = "json-status json-status--invalid";
      statusEl.innerHTML = "<span>Empty editor</span><span>Paste or load template</span>";
      if (submitBtn) submitBtn.disabled = true;
      return null;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Payload must be a single JSON object");
      }
      if (!parsed.title || !parsed.title.trim()) {
        throw new Error("Missing required field: 'title'");
      }
      if (!parsed.contribution_type) {
        throw new Error("Missing required field: 'contribution_type'");
      }

      statusEl.className = "json-status json-status--valid";
      statusEl.innerHTML = `
        <span>✓ Valid JSON &amp; Schema</span>
        <span class="mono" style="font-size:.6875rem">type: ${escapeHtml(parsed.contribution_type)} &middot; media: ${escapeHtml(parsed.media_type || "anime")}</span>
      `;
      if (submitBtn) submitBtn.disabled = false;
      return parsed;
    } catch (err) {
      statusEl.className = "json-status json-status--invalid";
      statusEl.innerHTML = `
        <span>✗ Syntax / Schema Error</span>
        <span class="mono" style="font-size:.6875rem">${escapeHtml(err.message)}</span>
      `;
      if (submitBtn) submitBtn.disabled = true;
      return null;
    }
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const payload = validateJson();
      if (!payload) return;

      setLoading(submitBtn, true);
      try {
        const res = await submitContribution(payload);
        showOutcome(res);
      } catch (err) {
        showOutcome({
          status: "ERROR",
          message: err.message || "Failed to submit JSON contribution."
        });
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }
}

/* ---- 4. Outcome Presentation ---------------------------------------------- */

function showOutcome(res) {
  const card = $("#contrib-outcome");
  if (!card) return;

  const isSuccess = res.status === "CREATED";
  const isUpvoted = res.status === "UPVOTED_EXISTING_SUBMISSION";
  const isCatalog = res.status === "ALREADY_IN_CATALOG";

  let badgeHtml = "";
  let cardClass = "submission-card";
  if (isSuccess) {
    badgeHtml = `<span class="badge badge--live">✓ Registered in Queue</span>`;
    cardClass = "submission-card submission-card--success";
  } else if (isUpvoted) {
    badgeHtml = `<span class="badge badge--sakura">▲ Upvoted Existing Submission</span>`;
    cardClass = "submission-card submission-card--upvote";
  } else if (isCatalog) {
    badgeHtml = `<span class="badge" style="background:var(--paper-deep);color:var(--amber);border:1px solid var(--amber)">ℹ Already in Catalog</span>`;
    cardClass = "submission-card submission-card--catalog";
  } else {
    badgeHtml = `<span class="badge" style="background:rgba(156,59,46,0.15);color:var(--rust);border:1px solid var(--rust)">✗ Error</span>`;
    cardClass = "submission-card submission-card--error";
  }

  card.className = cardClass;
  card.style.display = "block";
  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);flex-wrap:wrap;gap:var(--space-2)">
      <div style="display:flex;align-items:center;gap:.6rem">
        ${badgeHtml}
        ${res.submission_id ? `<span class="mono faint" style="font-size:.75rem">#${res.submission_id}</span>` : ""}
      </div>
      ${res.upvotes_count ? `<span class="upvote-badge">▲ ${res.upvotes_count} Upvotes</span>` : ""}
    </div>
    <div style="font-family:var(--serif);font-size:1.0625rem;line-height:1.6;color:var(--ink);margin-bottom:var(--space-2)">
      ${escapeHtml(res.message || "Submission received.")}
    </div>
    ${res.canonical_work_id ? `
      <div style="font-family:var(--mono);font-size:.75rem;color:var(--ink-soft);padding:.35rem .6rem;background:var(--paper-deep);border-radius:4px;display:inline-block">
        Canonical Match: <strong>${escapeHtml(res.canonical_work_id)}</strong>
      </div>
    ` : ""}
  `;

  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---- Helpers -------------------------------------------------------------- */

function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  const span = btn.querySelector("span");
  if (span) {
    span.textContent = isLoading ? "Submitting…" : span.textContent;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
