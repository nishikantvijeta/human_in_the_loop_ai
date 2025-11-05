// routes/agent.js
const express = require("express");
const db = require("../firebase");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Very small in-memory KB fallback for fast known answers (optional)
const localKB = [
  { qTokens: ["hour", "open"], answer: "We are open 10 AM to 8 PM, closed on Tuesdays." },
  { qTokens: ["service", "services", "haircut"], answer: "We offer Haircut, Hair Coloring and Nail Care." }
];

// normalize helper
function normalize(text = "") {
  return text.toLowerCase().trim();
}

async function queryKB(question) {
  const qn = normalize(question);
  // 1) Simple local KB match
  for (const item of localKB) {
    if (item.qTokens.some(t => qn.includes(t))) return { answer: item.answer, source: "local" };
  }

  // 2) Firestore KB exact normalized match (fast path)
  // We store question_normalized field in knowledge_base documents.
  const kbRef = db.collection("knowledge_base");
  const snap = await kbRef.where("question_normalized", "==", qn).limit(1).get();
  if (!snap.empty) {
    const doc = snap.docs[0].data();
    return { answer: doc.answer, source: "kb" };
  }

  // 3) Could add fuzzy or embedding lookup here later

  return null;
}

// POST /agent/call
// body: { customer_name, phone, question }
router.post("/call", async (req, res) => {
  try {
    console.log("[agent/call] Incoming call data:", req.body);
    const { customer_name, phone, question } = req.body;
    if (!question || !phone) return res.status(400).json({ error: "phone and question required" });

    console.log(`[INCOMING CALL] ${customer_name || "Unknown"} (${phone}): ${question}`);

    const hit = await queryKB(question);
    if (hit) {
      console.log(`[AI -> ${phone}] (answered from ${hit.source}): ${hit.answer}`);
      return res.json({ handled: true, answer: hit.answer, source: hit.source });
    }

    // AI does not know -> create help_request in Firestore
    const id = uuidv4();
    const helpRef = db.collection("help_requests").doc(id);
    const now = Date.now();
    await helpRef.set({
      id,
      customer: {
        name: customer_name || null,
        phone
      },
      question,
      question_normalized: normalize(question),
      status: "pending",
      created_at: now,
      updated_at: now,
      timeout_seconds: 600, // default 10 minutes; changeable later
      metadata: { source: "simulated_livekit" }
    });

    // Simulate notifying supervisor (console + webhook placeholder)
    console.log(`[SUPERVISOR ALERT] Need help answering "${question}" (request ${id})`);
    // If you had a webhook URL or Slack, you could POST to it here.

    // Response to caller (simulated)
    console.log(`[AI -> ${phone}] Let me check with my supervisor and get back to you.`);
    res.json({ handled: false, requestId: id });
  } catch (err) {
    console.error("agent/call error:", err);
    res.status(500).json({ error: "internal" });
  }
});

module.exports = router;
