import type { ConvertedPage } from "./types";

/** 복사·다운로드·LLM 전달이 함께 쓰는 문서: `# 제목` + 본문 전체. 프롬프트는 포함하지 않는다. */
export function fullMarkdown(page: Pick<ConvertedPage, "title" | "markdown">): string {
  return `# ${page.title}\n\n${page.markdown}`;
}

/** 파일명에 쓸 수 없는 문자를 뺀 이름. 비면 도메인을 쓴다. */
export function markdownFileName(page: Pick<ConvertedPage, "title" | "domain">): string {
  const name = page.title.replace(/[\\/:*?"<>|]/g, "").trim();
  return `${name || page.domain}.md`;
}
