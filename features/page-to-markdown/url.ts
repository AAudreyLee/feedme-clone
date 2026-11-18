/** 서버와 클라이언트가 함께 쓰는 http(s) 형식 검사. */
export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
