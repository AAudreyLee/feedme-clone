import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

import type { ConvertedPage, ConvertError } from "./types";
import { isHttpUrl } from "./url";

const FETCH_TIMEOUT_MS = 15_000;

export class ConvertFailure extends Error {
  constructor(public readonly error: ConvertError) {
    super(error.message);
  }
}

/** HTML 문자열에서 본문을 Markdown으로 추출한다. defuddle은 URL 문자열을 직접 받지 못하므로 DOM으로 만들어 넘긴다. */
export async function extractMarkdown(html: string, url: string): Promise<ConvertedPage> {
  const { document } = parseHTML(html);
  const result = await Defuddle(document as unknown as Document, url, { markdown: true });
  const markdown = result.content?.trim() ?? "";
  if (!markdown) {
    throw new ConvertFailure({ kind: "empty", message: "이 페이지에서 본문을 찾지 못했어요." });
  }
  const domain = new URL(url).hostname;
  return {
    title: result.title?.trim() || domain,
    author: result.author?.trim() ?? "",
    site: result.site?.trim() || domain,
    domain: result.domain?.trim() || domain,
    wordCount: result.wordCount ?? 0,
    markdown,
  };
}

export async function convertUrl(url: string): Promise<ConvertedPage> {
  if (!isHttpUrl(url)) {
    throw new ConvertFailure({
      kind: "invalid-url",
      message: "http:// 또는 https:// 로 시작하는 웹 페이지 주소를 입력해 주세요.",
    });
  }
  const host = new URL(url).host;
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "user-agent": "Mozilla/5.0 (compatible; feedme-clone)", accept: "text/html,*/*" },
    });
  } catch {
    throw new ConvertFailure({
      kind: "unreachable",
      message: `페이지에 연결하지 못했어요. 주소가 정확한지, 사이트가 열려 있는지 확인해 주세요. (${host})`,
    });
  }
  if (!response.ok) {
    throw new ConvertFailure({
      kind: "http-error",
      message: `페이지가 오류로 응답했어요. (${response.status}) ${host}`,
    });
  }
  return extractMarkdown(await response.text(), response.url || url);
}
