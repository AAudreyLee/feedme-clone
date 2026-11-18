import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Converter } from "@/features/page-to-markdown/converter";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between border-b py-2">
        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            md
          </span>
          feedme
        </div>
        <div className="flex items-center gap-1">
          <Link href="/settings" className={buttonVariants({ variant: "ghost" })}>
            설정
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-[28px]">
          웹 페이지를 LLM이 바로 읽는 Markdown으로
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          URL을 붙여넣으면 광고와 메뉴를 걷어낸 본문만 남깁니다. 복사하거나, 프롬프트와 함께 ChatGPT·Claude로 바로 넘기세요.
        </p>
      </div>
      <Converter />
    </main>
  );
}
