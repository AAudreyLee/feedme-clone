"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({
  userId,
  initialDisplayName,
}: {
  userId: string;
  initialDisplayName: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSaved(false);

    // RLS가 본인 행만 허용합니다. 갱신된 행이 없으면 권한이 없는 것입니다.
    const { data, error } = await createClient()
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", userId)
      .select("display_name");

    if (error) {
      setError(error.message);
    } else if (!data || data.length === 0) {
      setError("프로필을 저장하지 못했습니다.");
    } else {
      setDisplayName(data[0].display_name);
      setSaved(true);
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="display-name">표시 이름</FieldLabel>
        <Input
          id="display-name"
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <FieldDescription>최대 50자까지 입력할 수 있습니다.</FieldDescription>
      </Field>
      {error && <FieldError>{error}</FieldError>}
      {saved && (
        <p role="status" className="text-sm text-muted-foreground">
          저장했습니다.
        </p>
      )}
      <Button type="submit" disabled={isLoading} className="self-start">
        {isLoading ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
