// 로그인 후 이동할 경로는 같은 사이트 안의 경로만 허용합니다.
export function safeNextPath(next: string | null | undefined, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
