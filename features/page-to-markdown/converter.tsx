"use client";

import { CircleAlertIcon, FileTextIcon, Loader2Icon, XIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { ResultCard } from "./result-card";
import type { ConvertedPage, ConvertError } from "./types";
import { isHttpUrl } from "./url";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ConvertError }
  | { status: "done"; page: ConvertedPage; url: string };

const EXAMPLES = ["https://stephango.com/saw", "https://ko.wikipedia.org/wiki/마크다운"];

const ERROR_TITLE: Record<ConvertError["kind"], string> = {
  "invalid-url": "주소 형식이 올바르지 않아요",
  unreachable: "페이지에 연결하지 못했어요",
  "http-error": "페이지가 오류로 응답했어요",
  empty: "본문을 추출하지 못했어요",
};

export function Converter() {
  const [input, setInput] = useState("");
  const [formatError, setFormatError] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });
  const loading = state.status === "loading";

  async function convert(raw: string) {
    const url = raw.trim();
    if (!isHttpUrl(url)) {
      setFormatError(true);
      return;
    }
    setFormatError(false);
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setState(res.ok ? { status: "done", page: data, url } : { status: "error", error: data });
    } catch {
      setState({
        status: "error",
        error: { kind: "unreachable", message: "변환 서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요." },
      });
    }
  }

  function clear() {
    setInput("");
    setFormatError(false);
    setState({ status: "idle" });
  }

  return (
    <>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) void convert(input);
        }}
      >
        <Field data-invalid={formatError || undefined}>
          <FieldLabel htmlFor="url">페이지 URL</FieldLabel>
          <div className="flex gap-2 max-sm:flex-wrap">
            <div className="relative min-w-0 flex-1 max-sm:basis-full">
              <Input
                id="url"
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://example.com/article"
                className="h-10 pr-10"
                value={input}
                readOnly={loading}
                aria-invalid={formatError}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFormatError(false);
                }}
              />
              {input && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="지우기"
                  title="지우기"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={clear}
                >
                  <XIcon />
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" disabled={loading || !input.trim()} className="max-sm:flex-1">
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              {loading ? "변환 중…" : "변환"}
            </Button>
          </div>
          {formatError && (
            <FieldError>http:// 또는 https:// 로 시작하는 웹 페이지 주소를 입력해 주세요.</FieldError>
          )}
        </Field>
      </form>

      {state.status === "idle" && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileTextIcon /></EmptyMedia>
            <EmptyTitle>아직 변환한 페이지가 없어요</EmptyTitle>
            <EmptyDescription>블로그 글, 뉴스 기사, 문서 페이지처럼 본문이 있는 주소가 잘 변환됩니다.</EmptyDescription>
          </EmptyHeader>
          <div className="flex flex-wrap justify-center gap-1.5">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                type="button"
                variant="secondary"
                size="xs"
                className="font-mono text-muted-foreground"
                onClick={() => {
                  setInput(ex);
                  void convert(ex);
                }}
              >
                {ex.replace("https://", "")}
              </Button>
            ))}
          </div>
        </Empty>
      )}

      {state.status === "loading" && (
        <Card aria-busy="true" className="gap-0 py-0">
          <span className="sr-only">본문을 추출하는 중</span>
          <CardHeader className="gap-2 px-5 py-5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-3.5 w-2/5" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 border-t px-5 py-5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
          </CardContent>
        </Card>
      )}

      {state.status === "error" && (
        <Alert variant="destructive" role="alert">
          <CircleAlertIcon />
          <AlertTitle>{ERROR_TITLE[state.error.kind]}</AlertTitle>
          <AlertDescription>
            <p>{state.error.message}</p>
            <Button variant="outline" className="mt-2.5" onClick={() => void convert(input)}>
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {state.status === "done" && <ResultCard key={state.url} page={state.page} url={state.url} />}
    </>
  );
}
