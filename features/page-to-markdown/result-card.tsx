import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { ExportMarkdown } from "./export-markdown";
import { MarkdownView } from "./markdown-view";
import { SendToLlmPanel } from "./send-to-llm-panel";
import type { ConvertedPage } from "./types";

export function ResultCard({ page, url }: { page: ConvertedPage; url: string }) {
  const meta = [
    page.author && <span key="a">{page.author}</span>,
    page.site !== page.author && page.site !== page.domain && <span key="s">{page.site}</span>,
    <a key="d" href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
      {page.domain}
    </a>,
    <span key="w">{page.wordCount.toLocaleString("ko-KR")}단어</span>,
  ].filter(Boolean);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1.5 px-5 py-5">
        <CardTitle className="text-xl leading-snug">{page.title}</CardTitle>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          {meta.map((m, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>·</span>}
              {m}
            </span>
          ))}
        </div>
      </CardHeader>
      <SendToLlmPanel page={page} />
      <ExportMarkdown page={page} />
      <div className="border-t">
        <MarkdownView markdown={page.markdown} />
      </div>
    </Card>
  );
}
