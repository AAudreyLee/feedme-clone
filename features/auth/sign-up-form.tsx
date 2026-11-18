"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }

    setIsLoading(true);
    const { data, error } = await createClient().auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    if (!data.session) {
      // 이메일 확인이 꺼져 있으면 가입 즉시 세션이 생깁니다.
      setError("가입은 되었지만 로그인되지 않았습니다. 로그인 화면에서 다시 시도하세요.");
      setIsLoading(false);
      return;
    }
    router.push("/settings");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>이메일과 비밀번호로 계정을 만듭니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="repeat-password">비밀번호 확인</FieldLabel>
              <Input
                id="repeat-password"
                type="password"
                autoComplete="new-password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "가입 중..." : "가입하기"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있나요?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                로그인
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
