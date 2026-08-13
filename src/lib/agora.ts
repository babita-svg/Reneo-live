import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

// Configure Agora SDK settings
AgoraRTC.setLogLevel(2); // Warning level logs

export function createAgoraClient(): IAgoraRTCClient {
  return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
}

export async function fetchAgoraToken(channelName: string, uid: number | string, role: 'host' | 'audience') {
  try {
    const res = await fetch('/api/agora-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, uid, role }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch Agora token from server, using fallback token mechanism:', err);
    return {
      token: null,
      appId: 'demo_agora_reneo_app_id_8888',
      channelName,
      uid,
      role,
      isMock: true,
    };
  }
}

export async function createLocalTracks(): Promise<{
  audioTrack: IMicrophoneAudioTrack;
  videoTrack: ICameraVideoTrack;
}> {
  const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
  return { audioTrack, videoTrack };
}
