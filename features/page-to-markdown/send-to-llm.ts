export type LlmService = "ChatGPT" | "Claude";

/** 인코딩된 전체 URL 기준 한도. 넘으면 클립보드 경유로 보낸다. */
export const URL_LIMIT = 8000;

const NEW_CHAT_URL: Record<LlmService, string> = {
  ChatGPT: "https://chatgpt.com/",
  Claude: "https://claude.ai/new",
};

/** 프롬프트가 있으면 빈 줄 하나로 구분해 본문 앞에 붙인다. */
export function buildSendText(prompt: string, markdown: string): string {
  const p = prompt.trim();
  return p ? `${p}\n\n${markdown}` : markdown;
}

export function newChatUrl(service: LlmService, text?: string): string {
  const base = NEW_CHAT_URL[service];
  return text === undefined ? base : `${base}?q=${encodeURIComponent(text)}`;
}

/** 두 서비스 중 더 긴 URL 기준으로 한도 안에 들어가는지 본다. */
export function fitsInUrl(text: string): boolean {
  return (["ChatGPT", "Claude"] as const).every(
    (service) => newChatUrl(service, text).length <= URL_LIMIT,
  );
}
