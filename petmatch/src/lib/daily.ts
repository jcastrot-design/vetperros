const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = "https://api.daily.co/v1";

function headers() {
  return {
    Authorization: `Bearer ${DAILY_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function createDailyRoom(bookingId: string, expiresAt: Date) {
  if (!DAILY_API_KEY) throw new Error("DAILY_API_KEY no configurado");

  const res = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: `petmatch-${bookingId}`,
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000) + 60 * 60, // +1h de gracia
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: false,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    // Room already exists — get it
    if (res.status === 409 || (error as { info?: string }).info?.includes("already exists")) {
      return getDailyRoom(`petmatch-${bookingId}`);
    }
    throw new Error(`Daily.co error: ${res.status}`);
  }

  return res.json() as Promise<{ name: string; url: string }>;
}

export async function getDailyRoom(name: string) {
  if (!DAILY_API_KEY) throw new Error("DAILY_API_KEY no configurado");

  const res = await fetch(`${DAILY_API_URL}/rooms/${name}`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error(`Daily.co room not found: ${res.status}`);
  return res.json() as Promise<{ name: string; url: string }>;
}

export async function createDailyToken(
  roomName: string,
  userId: string,
  userName: string,
  isOwner: boolean,
  expiresAt: Date,
) {
  if (!DAILY_API_KEY) throw new Error("DAILY_API_KEY no configurado");

  const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        is_owner: isOwner,
        exp: Math.floor(expiresAt.getTime() / 1000) + 60 * 60,
        enable_screenshare: false,
      },
    }),
  });

  if (!res.ok) throw new Error(`Daily.co token error: ${res.status}`);
  const data = await res.json() as { token: string };
  return data.token;
}
