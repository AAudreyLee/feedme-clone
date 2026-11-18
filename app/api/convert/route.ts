import { ConvertFailure, convertUrl } from "@/features/page-to-markdown/convert";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  try {
    return Response.json(await convertUrl(url));
  } catch (e) {
    if (e instanceof ConvertFailure) {
      return Response.json(e.error, { status: e.error.kind === "invalid-url" ? 400 : 502 });
    }
    return Response.json({ kind: "empty", message: "변환 중 알 수 없는 오류가 났어요." }, { status: 500 });
  }
}
