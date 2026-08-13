import express from "express";
import agoraTokenPackage from "agora-token";
import { createClient } from "@supabase/supabase-js";

const RtcTokenBuilder = agoraTokenPackage.RtcTokenBuilder || (agoraTokenPackage as any).default?.RtcTokenBuilder;
const RtcRole = agoraTokenPackage.RtcRole || (agoraTokenPackage as any).default?.RtcRole || { PUBLISHER: 1, SUBSCRIBER: 2 };

export const app = express();

app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Healthcheck endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Reneo Live Server",
    timestamp: new Date().toISOString(),
    agoraConfigured: Boolean(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE),
    supabaseConfigured: Boolean(supabase),
  });
});

// A7/A8/A10: Server-side Agora Token Generation Route with Strict Authorization
app.post("/api/agora-token", async (req, res) => {
  try {
    const { channelName, uid, sessionId } = req.body;

    if (!channelName) {
      return res.status(400).json({ error: "channelName is required" });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    // A8: REMOVE FAKE MOCK TOKEN FALLBACK!
    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: "Agora RTC credentials missing on server",
        message: "AGORA_APP_ID and AGORA_APP_CERTIFICATE must be configured in environment variables.",
      });
    }

    const authHeader = req.headers.authorization;
    let authenticatedUserId: string | null = null;
    let userRole: string = "customer";

    // 1. Verify authenticated user if Auth header provided
    if (authHeader && authHeader.startsWith("Bearer ") && supabase) {
      const authToken = authHeader.split(" ")[1];
      const { data: { user }, error } = await supabase.auth.getUser(authToken);
      if (!error && user) {
        authenticatedUserId = user.id;

        // Fetch user's profile from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) {
          userRole = profile.role;
        }
      }
    }

    // 2. Validate requested live session & derive role server-side
    let isSessionHost = false;

    if (sessionId && supabase) {
      const { data: session } = await supabase
        .from("live_sessions")
        .select("host_id, status")
        .eq("live_id", sessionId)
        .single();

      if (session) {
        if (session.status === "ended") {
          return res.status(400).json({ error: "This live session has ended." });
        }
        if (authenticatedUserId && session.host_id === authenticatedUserId && userRole === "seller") {
          isSessionHost = true;
        }
      }
    }

    // Assign RTC Role based strictly on server authorization (Requirement 7)
    // Only verified session host gets PUBLISHER role. All others receive SUBSCRIBER.
    const rtcRole = isSessionHost ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const derivedRoleString = isSessionHost ? "host" : "audience";

    const numericUid = uid ? Number(uid) || 0 : 0;
    const expirationTimeInSeconds = 3600 * 24; // 24 hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

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
      role: derivedRoleString,
      expiresIn: expirationTimeInSeconds,
      isHost: isSessionHost,
    });
  } catch (error: any) {
    console.error("Error generating Agora token:", error);
    return res.status(500).json({ error: "Failed to generate token", details: error?.message });
  }
});
