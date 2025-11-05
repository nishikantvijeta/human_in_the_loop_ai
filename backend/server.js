// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const agentRoutes = require("./routes/agent.js");
const supervisorRoutes = require("./routes/superviser.js");
const timeoutWorker = require("./timeoutWorker");
const livekitRoutes =require("./routes/livekit.js");

const app = express();
app.use("/api/livekit", livekitRoutes);
app.use(cors());
app.use(bodyParser.json());

app.use("/agent", agentRoutes);        // POST /agent/call
app.use("/supervisor", supervisorRoutes); // GET /supervisor & POST /supervisor/:id/answer

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  // Start timeout worker
  timeoutWorker.start(60_000);
});
