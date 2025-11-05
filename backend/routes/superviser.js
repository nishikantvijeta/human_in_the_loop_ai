// routes/supervisor.js
const express = require("express");
const db = require("../firebase");
const router = express.Router();

// GET /supervisor?status=pending  (or resolved/unresolved/all)
router.get("/", async (req, res) => {
  try {
    const status = req.query.status || null;
    let q = db.collection("help_requests").orderBy("created_at", "desc").limit(500);
    if (status) q = q.where("status", "==", status);
    const snap = await q.get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    console.error("supervisor GET error:", err);
    res.status(500).json({ error: "internal" });
  }
});

// POST /supervisor/:id/answer  body: { answer, supervisor_id (optional) }
router.post("/:id/answer", async (req, res) => {
  try {
    const id = req.params.id;
    const { answer, supervisor_id } = req.body;
    if (!answer) return res.status(400).json({ error: "answer required" });

    const helpRef = db.collection("help_requests").doc(id);
    const helpSnap = await helpRef.get();
    if (!helpSnap.exists) return res.status(404).json({ error: "help request not found" });
    const help = helpSnap.data();

    // Ensure we don't double-resolve
    if (help.status === "resolved") {
      return res.status(409).json({ error: "already resolved" });
    }

    const now = Date.now();
    // Use transaction to update help_request and create KB atomically
    await db.runTransaction(async (t) => {
      t.update(helpRef, {
        status: "resolved",
        supervisor_answer: answer,
        supervisor_id: supervisor_id || null,
        resolved_at: now,
        updated_at: now
      });

      const kbRef = db.collection("knowledge_base").doc(); // new doc
      t.set(kbRef, {
        question_raw: help.question,
        question_normalized: help.question_normalized || help.question.toLowerCase().trim(),
        answer,
        source: "supervisor",
        source_request_id: id,
        created_at: now
      });
    });

    // Simulate AI texting back to caller
    console.log(`[AI -> ${help.customer.phone}] ${answer} (via supervisor)`);

    res.json({ ok: true });
  } catch (err) {
    console.error("supervisor answer error:", err);
    res.status(500).json({ error: "internal" });
  }
});

module.exports = router;
