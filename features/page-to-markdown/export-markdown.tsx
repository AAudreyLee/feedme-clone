"use client";

import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { fullMarkdown, markdownFileName } from "./markdown-export";
import type { ConvertedPage } from "./types";

export function ExportMarkdown({ page }: { page: ConvertedPage }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullMarkdown(page));
    } catch {
      toast.error("복사하지 못했어요", { description: "브라우저가 클립보드 접근을 막았어요." });
      return;
    }
    setCopied(true);
    toast("Markdown을 복사했어요");
    setTimeout(() => setCopied(false), 1800);
  }

  function download() {
    const name = markdownFileName(page);
    const url = URL.createObjectURL(new Blob([fullMarkdown(page)], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    toast("파일을 내려받았어요", { description: name });
  }

  return (
    <section className="flex flex-col gap-3 border-t px-5 py-4" aria-labelledby="export-title">
      <div className="flex flex-col gap-0.5">
        <h3 id="export-title" className="text-sm font-semibold">Markdown으로 내보내기</h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          제목과 본문 전체가 Markdown 그대로 담겨요. 프롬프트는 들어가지 않아요.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copy} className="max-sm:flex-1">
          {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
          {copied ? "복사됨" : "복사하기"}
        </Button>
        <Button variant="outline" onClick={download} className="max-sm:flex-1">
          <DownloadIcon data-icon="inline-start" />
          .md 다운로드
        </Button>
      </div>
    </section>
  );
}
