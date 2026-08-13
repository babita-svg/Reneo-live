import express from "express";
import agoraTokenPackage from "agora-token";

const RtcTokenBuilder = agoraTokenPackage.RtcTokenBuilder || (agoraTokenPackage as any).default?.RtcTokenBuilder;
const RtcRole = agoraTokenPackage.RtcRole || (agoraTokenPackage as any).default?.RtcRole || { PUBLISHER: 1, SUBSCRIBER: 2 };

export const app = express();

app.use(express.json());

// Healthcheck endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Reneo Live Server",
    timestamp: new Date().toISOString(),
    agoraConfigured: Boolean(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE),
  });
});

// A10: Server-side Agora Token Generation Route
app.post("/api/agora-token", (req, res) => {
  try {
    const { channelName, uid, role } = req.body;

    if (!channelName) {
      return res.status(400).json({ error: "channelName is required" });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    const numericUid = uid ? Number(uid) || 0 : 0;
    const rtcRole = role === "host" || role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600 * 24; // 24 hours validity
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    if (appId && appCertificate) {
      // Generate real secure Agora RTC Token
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        numericUid,
        rtcRole,
        expirationTimeInSeconds,
        privilegeExpiredTs
      );

      return res.json({
        token,
        appId,
        channelName,
        uid: numericUid,
        role: role || "audience",
        expiresIn: expirationTimeInSeconds,
        isMock: false,
      });
    } else {
      // Fallback demo/mock token for evaluation when env credentials are not configured
      const demoAppId = "demo_agora_reneo_app_id_8888";
      const mockToken = `reneo_rtc_token_${channelName}_${role}_${numericUid}_${privilegeExpiredTs}`;

      return res.json({
        token: mockToken,
        appId: demoAppId,
        channelName,
        uid: numericUid,
        role: role || "audience",
        expiresIn: expirationTimeInSeconds,
        isMock: true,
        message: "Agora credentials not supplied in env. Operating in demo broadcast mode.",
      });
    }
  } catch (error: any) {
    console.error("Error generating Agora token:", error);
    return res.status(500).json({ error: "Failed to generate token", details: error?.message });
  }
});
