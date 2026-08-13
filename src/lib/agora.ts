import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

// Configure Agora SDK settings
AgoraRTC.setLogLevel(2); // Warning level logs

export function createAgoraClient(): IAgoraRTCClient {
  return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
}

export async function fetchAgoraToken(
  channelName: string,
  uid: number | string,
  sessionId?: string,
  authToken?: string
): Promise<{
  token: string;
  appId: string;
  channelName: string;
  uid: number;
  role: 'host' | 'audience';
  expiresIn: number;
  isHost: boolean;
}> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/agora-token', {
    method: 'POST',
    headers,
    body: JSON.stringify({ channelName, uid, sessionId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || `Server returned status ${res.status}`);
  }

  return data;
}

export async function createLocalTracks(): Promise<{
  audioTrack: IMicrophoneAudioTrack;
  videoTrack: ICameraVideoTrack;
}> {
  try {
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
      {
        AEC: true,
        ANS: true,
      },
      {
        encoderConfig: '720p_1',
      }
    );
    return { audioTrack, videoTrack };
  } catch (err: any) {
    console.error('Camera/Microphone track creation error:', err);
    if (err.name === 'NotAllowedError' || err.code === 'PERMISSION_DENIED') {
      throw new Error('Camera access was blocked. Please allow camera and microphone permissions in your browser settings and try again.');
    } else if (err.name === 'NotFoundError' || err.code === 'MEDIA_DEVICE_NOT_FOUND') {
      throw new Error('No camera or microphone device found. Please attach a video input device.');
    } else {
      throw new Error(`Media device error: ${err.message || 'Unable to access camera/microphone.'}`);
    }
  }
}
