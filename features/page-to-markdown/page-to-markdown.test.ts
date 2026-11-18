import { describe, expect, test } from "vitest";

import { ConvertFailure, extractMarkdown } from "./convert";
import { isHttpUrl } from "./url";
import { fullMarkdown, markdownFileName } from "./markdown-export";
import { buildSendText, fitsInUrl, newChatUrl, URL_LIMIT } from "./send-to-llm";

describe("markdown-export", () => {
  test("제목과 본문 전체를 합친다", () => {
    expect(fullMarkdown({ title: "T", markdown: "body" })).toBe("# T\n\nbody");
  });
  test("파일명에서 쓸 수 없는 문자를 빼고, 비면 도메인을 쓴다", () => {
    expect(markdownFileName({ title: 'a/b:c?"', domain: "x.com" })).toBe("abc.md");
    expect(markdownFileName({ title: "  ", domain: "x.com" })).toBe("x.com.md");
  });
});

describe("send-to-llm", () => {
  test("프롬프트는 빈 줄로 구분해 앞에 붙고, 없으면 본문만 간다", () => {
    expect(buildSendText("요약해줘", "# T")).toBe("요약해줘\n\n# T");
    expect(buildSendText("  ", "# T")).toBe("# T");
  });
  test("새 채팅 URL에 텍스트를 인코딩해 넣는다", () => {
    expect(newChatUrl("ChatGPT", "a b")).toBe("https://chatgpt.com/?q=a%20b");
    expect(newChatUrl("Claude", "a b")).toBe("https://claude.ai/new?q=a%20b");
    expect(newChatUrl("Claude")).toBe("https://claude.ai/new");
  });
  test("인코딩된 URL이 한도를 넘으면 맞지 않는 것으로 본다", () => {
    expect(fitsInUrl("짧은 글")).toBe(true);
    expect(fitsInUrl("가".repeat(URL_LIMIT))).toBe(false);
  });
});

describe("convert", () => {
  test("http(s) URL만 받는다", () => {
    expect(isHttpUrl("https://a.com")).toBe(true);
    expect(isHttpUrl("ftp://a.com")).toBe(false);
    expect(isHttpUrl("nope")).toBe(false);
  });
  test("HTML에서 제목·본문을 Markdown으로 뽑고, 저자가 없으면 빈 값이다", async () => {
    const html = `<html><head><title>Hello</title></head><body><article><h1>Hello</h1>
      <p>${"This is a paragraph of real article text. ".repeat(10)}</p><h2>Part</h2>
      <p>${"Another paragraph with enough words to count. ".repeat(10)}</p></article></body></html>`;
    const page = await extractMarkdown(html, "https://example.com/post");
    expect(page.title).toBe("Hello");
    expect(page.author).toBe("");
    expect(page.markdown).toContain("paragraph");
  });
  test("본문이 없으면 empty 오류", async () => {
    await expect(extractMarkdown("<html><body></body></html>", "https://e.com")).rejects.toBeInstanceOf(
      ConvertFailure,
    );
  });
});
