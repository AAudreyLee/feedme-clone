export type ConvertedPage = {
  title: string;
  author: string;
  site: string;
  domain: string;
  wordCount: number;
  /** 제목을 뺀 본문 Markdown */
  markdown: string;
};

export type ConvertErrorKind = "invalid-url" | "unreachable" | "http-error" | "empty";

export type ConvertError = { kind: ConvertErrorKind; message: string };
