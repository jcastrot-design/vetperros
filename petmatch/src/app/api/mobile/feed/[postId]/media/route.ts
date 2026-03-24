import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getMobileSession(req);
  if (!session) return new Response("No autenticado", { status: 401 });

  const { postId } = await params;
  const post = await prisma.feedPost.findUnique({
    where: { id: postId },
    select: { mediaData: true, mediaType: true },
  });

  if (!post?.mediaData) return new Response("Not found", { status: 404 });

  // Parse: "data:image/jpeg;base64,..."
  const [header, data] = post.mediaData.split(",");
  const mimeType = header.split(":")[1]?.split(";")[0] ?? "image/jpeg";
  const buffer = Buffer.from(data, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
