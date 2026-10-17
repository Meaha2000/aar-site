/* ============================================================================
   AAR — Community Contributions & Ingestion Controller
   Handles interactive form, JSON drag-and-drop/editor, live schema validation,
   and community submission queue display.
   ========================================================================= */

import { submitContribution, getContributionsQueue, ApiError } from "./api.js?v=2";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Templates for the JSON editor
const TEMPLATES = {
  ADD_WORK: {
    contribution_type: "ADD_WORK",
    media_type: "anime",
    title: "Example Title (e.g., Dennou Coil Special)",
    alt_titles: ["Denno Coil Special", "Coil A Circle of Children OVA"],
    suggested_tags: ["Sci-Fi", "Mystery", "Augmented Reality"],
    reference_url: "https://myanimelist.net/anime/...",
    custom_description: "A missing special episode or short that expands on the AR glasses world.",
    synopsis_or_note: "Currently missing from index, was broadcast in 2007.",
    submitter_id: "anonymous"
  },
  ADD_ALIAS: {
    contribution_type: "ADD_ALIAS",
    media_type: "anime",
    title: "Cowboy Bebop",
    target_work_id: "work:anime:mal_1_al_1",
    alt_titles: ["كابوي بيبوب", "Kauboi Bibappu", "Space Cowboy"],
    synopsis_or_note: "Adding Arabic localization title and common phonetic transcription.",
    submitter_id: "anonymous"
  },
  EDIT_METADATA: {
    contribution_type: "EDIT_METADATA",
    media_type: "visual_novel",
    title: "Steins;Gate",
    target_work_id: "work:visual_novel:vndb_v2002",
    suggested_tags: ["Time Travel", "Psychological", "Sci-Fi", "Chiyomaru"],
    reference_url: "https://vndb.org/v2002",
    synopsis_or_note: "Updating primary genre tags and creator attribution.",
    submitter_id: "anonymous"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initForm();
  initJsonEditor();
  loadQueue();
});

/* ---- 1. Tab Switching ---------------------------------------------------- */

function initTabs() {
  const tabBtns = $$("[data-tab-btn]");
  const tabPanels = $$("[data-tab-panel]");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-btn");

      tabBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      tabPanels.forEach((p) => {
        p.style.display = "none";
        p.setAttribute("aria-hidden", "true");
      });

      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const activePanel = $(`#${targetId}`);
      if (activePanel) {
        activePanel.style.display = "block";
        activePanel.setAttribute("aria-hidden", "false");
      }
    });
  });
}

/* ---- 2. Interactive Form ------------------------------------------------- */

function initForm() {
  const form = $("[data-contrib-form]");
  if (!form) return;

  const typeChips = $$("[data-contrib-type]");
  const mediaChips = $$("[data-media-type]");
  const targetIdField = $("[data-field-target-id]");
  const statusEl = $("[data-form-status]");
  const submitBtn = $("[data-form-submit]");

  let selectedType = "ADD_WORK";
  let selectedMedia = "anime";

  typeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      typeChips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      selectedType = chip.getAttribute("data-contrib-type");

      // Show target ID hint if adding alias or editing metadata
      if (targetIdField) {
        if (selectedType === "ADD_ALIAS" || selectedType === "EDIT_METADATA") {
          targetIdField.style.display = "block";
          const input = targetIdField.querySelector("input");
          if (input) input.placeholder = "work:anime:mal_1_al_1 (Required for aliases & edits)";
        } else {
          targetIdField.style.display = "none";
        }
      }
    });
  });

  mediaChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      mediaChips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      selectedMedia = chip.getAttribute("data-media-type");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titleInput = $("#field-title");
    const titleVal = titleInput ? titleInput.value.trim() : "";
    if (!titleVal) {
      showOutcome({
        status: "ERROR",
        message: "Title cannot be empty. Please provide the title of the work.",
      });
      if (titleInput) titleInput.focus();
      return;
    }

    const targetIdInput = $("#field-target-id");
    const targetIdVal = targetIdInput ? targetIdInput.value.trim() : "";

    const altTitlesInput = $("#field-alt-titles");
    const altTitlesVal = altTitlesInput
      ? altTitlesInput.value.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : [];

    const tagsInput = $("#field-tags");
    const tagsVal = tagsInput
      ? tagsInput.value.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : [];

    const refUrlInput = $("#field-ref-url");
    const refUrlVal = refUrlInput ? refUrlInput.value.trim() : null;

    const descInput = $("#field-desc");
    const descVal = descInput ? descInput.value.trim() : null;

    const noteInput = $("#field-note");
    const noteVal = noteInput ? noteInput.value.trim() : null;

    const submitterInput = $("#field-submitter");
    const submitterVal = submitterInput && submitterInput.value.trim() ? submitterInput.value.trim() : "anonymous";

    const payload = {
      contribution_type: selectedType,
      media_type: selectedMedia,
      title: titleVal,
      target_work_id: targetIdVal || null,
      alt_titles: altTitlesVal,
      suggested_tags: tagsVal,
      reference_url: refUrlVal || null,
      custom_description: descVal || null,
      synopsis_or_note: noteVal || null,
      submitter_id: submitterVal,
    };

    setLoading(submitBtn, true);
    try {
      const res = await submitContribution(payload);
      showOutcome(res);
      form.reset();
      loadQueue();
    } catch (err) {
      showOutcome({
        status: "ERROR",
        message: err.message || "Failed to submit contribution. Check connectivity.",
      });
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ---- 3. JSON Upload & Editor --------------------------------------------- */

function initJsonEditor() {
  const editor = $("#json-editor");
  const dropzone = $("#json-dropzone");
  const fileInput = $("#json-file-input");
  const statusEl = $("#json-status");
  const submitBtn = $("#json-submit");
  const prettifyBtn = $("#json-prettify");
  const templateBtns = $$("[data-template]");

  if (!editor) return;

  // Set default initial template
  editor.value = JSON.stringify(TEMPLATES.ADD_WORK, null, 2);
  validateJson();

  // Validate on keystroke
  editor.addEventListener("input", () => validateJson());

  // Template buttons
  templateBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-template");
      if (TEMPLATES[type]) {
        editor.value = JSON.stringify(TEMPLATES[type], null, 2);
        validateJson();
      }
    });
  });

  // Prettify button
  if (prettifyBtn) {
    prettifyBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(editor.value);
        editor.value = JSON.stringify(parsed, null, 2);
        validateJson();
      } catch (err) {
        // syntax error handled by validator
      }
    });
  }

  // Dropzone drag-and-drop
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
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });
  }

  function handleFile(file) {
    if (!file.name.endsWith(".json") && file.type && !file.type.includes("json")) {
      alert("Please upload a valid .json file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        editor.value = content;
        try {
          const parsed = JSON.parse(content);
          editor.value = JSON.stringify(parsed, null, 2);
        } catch (_) {}
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
      statusEl.innerHTML = "<span>Empty editor</span><span>Paste or upload JSON</span>";
      if (submitBtn) submitBtn.disabled = true;
      return null;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Payload must be a JSON object conforming to ContributionCreateRequest");
      }
      if (!parsed.title || !parsed.title.trim()) {
        throw new Error("Missing required field: 'title'");
      }
      if (!parsed.contribution_type) {
        throw new Error("Missing required field: 'contribution_type' (e.g. ADD_WORK, ADD_ALIAS, EDIT_METADATA)");
      }

      statusEl.className = "json-status json-status--valid";
      statusEl.innerHTML = `
        <span>✓ Valid JSON &amp; Schema</span>
        <span class="mono" style="font-size:.6875rem">type: ${escapeHtml(parsed.contribution_type)} · media: ${escapeHtml(parsed.media_type || "anime")}</span>
      `;
      if (submitBtn) submitBtn.disabled = false;
      return parsed;
    } catch (err) {
      statusEl.className = "json-status json-status--invalid";
      statusEl.innerHTML = `
        <span>✗ Schema / Syntax Error</span>
        <span class="mono" style="font-size:.6875rem">${escapeHtml(err.message)}</span>
      `;
      if (submitBtn) submitBtn.disabled = true;
      return null;
    }
  }

  // JSON Submit handler
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const payload = validateJson();
      if (!payload) return;

      setLoading(submitBtn, true);
      try {
        const res = await submitContribution(payload);
        showOutcome(res);
        loadQueue();
      } catch (err) {
        showOutcome({
          status: "ERROR",
          message: err.message || "Failed to submit JSON contribution.",
        });
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }
}

/* ---- 4. Outcome Drawer / Notification ------------------------------------- */

function showOutcome(res) {
  const card = $("#submission-outcome");
  if (!card) return;

  const isSuccess = res.status === "CREATED";
  const isUpvoted = res.status === "UPVOTED_EXISTING_SUBMISSION";
  const isCatalog = res.status === "ALREADY_IN_CATALOG";
  const isError = res.status === "ERROR";

  let badgeHtml = "";
  if (isSuccess) {
    badgeHtml = `<span class="badge badge--live">✓ Registered in Queue</span>`;
  } else if (isUpvoted) {
    badgeHtml = `<span class="badge badge--sakura">▲ Upvoted Existing Submission</span>`;
  } else if (isCatalog) {
    badgeHtml = `<span class="badge" style="background:var(--paper-deep);color:var(--amber);border:1px solid var(--amber)">ℹ Already In Catalog</span>`;
  } else {
    badgeHtml = `<span class="badge" style="background:rgba(156,59,46,0.15);color:var(--rust);border:1px solid var(--rust)">✗ Error</span>`;
  }

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
      <div style="font-family:var(--mono);font-size:.75rem;color:var(--ink-soft);padding:.4rem .6rem;background:var(--paper-deep);border-radius:4px;display:inline-block">
        Matched Canonical Work: <strong>${escapeHtml(res.canonical_work_id)}</strong>
      </div>
    ` : ""}
  `;

  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---- 5. Recent Community Ingestion Queue ---------------------------------- */

async function loadQueue() {
  const container = $("#queue-container");
  if (!container) return;

  try {
    const data = await getContributionsQueue({ status: "PENDING", limit: 8 });
    const items = data?.submissions || [];

    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding:var(--space-4);text-align:center;font-family:var(--serif);color:var(--ink-soft)">
          No pending submissions in queue. Be the first to contribute!
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="queue-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Media</th>
            <th style="text-align:right">Upvotes</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><span class="mono" style="font-size:.6875rem;letter-spacing:.05em">${escapeHtml(item.contribution_type)}</span></td>
              <td><strong>${escapeHtml(item.title)}</strong></td>
              <td><span class="mono faint" style="font-size:.75rem">${escapeHtml(item.media_type)}</span></td>
              <td style="text-align:right"><span class="upvote-badge">▲ ${item.upvotes_count}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `
      <div style="padding:var(--space-3);font-family:var(--mono);font-size:.75rem;color:var(--ink-faint)">
        Queue preview currently offline or empty.
      </div>
    `;
  }
}

/* ---- Helpers -------------------------------------------------------------- */

function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  const label = btn.querySelector("[data-btn-label]");
  const spinner = btn.querySelector("[data-btn-spinner]");
  if (label && spinner) {
    if (isLoading) {
      label.style.opacity = "0.5";
      spinner.style.display = "inline-block";
    } else {
      label.style.opacity = "1";
      spinner.style.display = "none";
    }
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
