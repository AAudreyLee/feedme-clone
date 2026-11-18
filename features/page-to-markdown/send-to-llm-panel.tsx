"use client";

import { ArrowUpRightIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { fullMarkdown } from "./markdown-export";
import { buildSendText, fitsInUrl, newChatUrl, type LlmService } from "./send-to-llm";
import type { ConvertedPage } from "./types";

const PRESETS = [
  { id: "summary", label: "요약해줘", text: "이 글을 핵심만 요약해줘." },
  { id: "translate", label: "한국어로 번역해줘", text: "이 글을 자연스러운 한국어로 번역해줘." },
  { id: "easy", label: "쉽게 설명해줘", text: "이 글을 처음 보는 사람도 이해하게 쉽게 설명해줘." },
] as const;
const CUSTOM = "custom";

export function SendToLlmPanel({ page }: { page: ConvertedPage }) {
  // 선택과 직접 입력 텍스트는 이 컴포넌트 state에만 두고 어디에도 저장하지 않는다.
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const prompt =
    selected === CUSTOM ? custom.trim() : (PRESETS.find((p) => p.id === selected)?.text ?? "");
  const text = buildSendText(prompt, fullMarkdown(page));
  const tooLong = !fitsInUrl(text);

  function open(service: LlmService) {
    if (tooLong) {
      // 클릭 직후 동기로 탭을 열어야 팝업 차단을 피한다.
      void navigator.clipboard.writeText(text).catch(() => {});
      window.open(newChatUrl(service), "_blank", "noopener,noreferrer");
      toast("본문이 길어 클립보드에 복사했어요", {
        description: `${service} 새 채팅이 열렸어요. 입력란에 붙여넣으세요 (Ctrl+V).`,
        duration: 6000,
      });
    } else {
      window.open(newChatUrl(service, text), "_blank", "noopener,noreferrer");
      toast(`${service} 새 채팅을 열었어요`, {
        description: prompt
          ? `"${prompt}" 프롬프트와 본문이 입력란에 채워져 있어요.`
          : "본문이 입력란에 채워져 있어요.",
      });
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t px-5 py-4" aria-labelledby="send-title">
      <div className="flex flex-col gap-0.5">
        <h3 id="send-title" className="text-sm font-semibold">ChatGPT·Claude로 보내기</h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          고른 프롬프트를 맨 앞에 붙이고, 그 아래에 제목과 본문 전체를 넣어 새 채팅을 열어요.
        </p>
      </div>
      <div id="prompt-label" className="text-[13px] font-medium">
        앞에 붙일 프롬프트 <small className="ml-1 font-normal text-muted-foreground">선택</small>
      </div>
      <ToggleGroup
        variant="outline"
        spacing={2}
        className="flex-wrap"
        aria-labelledby="prompt-label"
        value={selected ? [selected] : []}
        onValueChange={(v) => setSelected(v[v.length - 1] ?? null)}
      >
        {PRESETS.map((p) => (
          <ToggleGroupItem key={p.id} value={p.id}>{p.label}</ToggleGroupItem>
        ))}
        <ToggleGroupItem value={CUSTOM}>직접 입력</ToggleGroupItem>
      </ToggleGroup>
      {selected === CUSTOM && (
        <div className="flex flex-col gap-1.5">
          <Input
            aria-label="직접 입력한 프롬프트"
            placeholder="예: 이 글에서 실무에 쓸 만한 팁만 뽑아줘"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            autoFocus
          />
          <p className="text-[13px] text-muted-foreground">이 프롬프트는 저장되지 않아요.</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5 rounded-lg bg-muted px-3 py-2.5 text-[13px]" aria-live="polite">
        <div className="text-xs font-medium text-muted-foreground">보낼 내용</div>
        <ol className="flex list-decimal flex-col gap-1 pl-5 leading-normal marker:text-muted-foreground">
          <li>
            <Tag>프롬프트</Tag>
            {!selected ? (
              <span className="text-muted-foreground">없음 — 본문만 보내요</span>
            ) : !prompt ? (
              <span className="text-muted-foreground">직접 입력한 문장이 여기에 들어가요</span>
            ) : (
              <>“{prompt}”</>
            )}
          </li>
          <li>
            <Tag>Markdown</Tag>
            {`# ${page.title} + 본문 전체 (${page.wordCount.toLocaleString("ko-KR")}단어)`}
          </li>
        </ol>
        {tooLong && (
          <p className="flex gap-1.5 text-xs leading-normal text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            글이 길어서 입력란을 바로 채울 수 없어요. 열기를 누르면 위 내용 전체를 클립보드에 복사하고 빈 새 채팅을 열어요. 입력란에 붙여넣으면 돼요.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ChatGPT", "Claude"] as const).map((service) => (
          <Button key={service} onClick={() => open(service)} className="max-sm:flex-1">
            {service}로 열기
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        ))}
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-1.5 inline-block rounded border bg-background px-1.5 py-px align-[1px] font-mono text-[11px] font-medium">
      {children}
    </span>
  );
}
