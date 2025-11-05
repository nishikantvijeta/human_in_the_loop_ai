const express = require("express");
const { AccessToken } = require("livekit-server-sdk");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// POST /api/livekit/token
router.post("/token", async (req, res) => {
  const { roomName, participantName } = req.body;

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: participantName }
  );

  token.addGrant({ roomJoin: true, room: roomName });

  res.json({ token: token.toJwt() });
});

module.exports =  router;
