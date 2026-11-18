import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth/logout-button";
import { ProfileForm } from "@/features/profile/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  // 서버에서 검증된 신원으로만 판단합니다. proxy.ts와 별개로 한 번 더 확인합니다.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/auth/login?next=/settings");
  }
  const userId = data.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between border-b py-2">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          feedme
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            홈
          </Link>
          <LogoutButton />
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>{data.claims.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm userId={userId} initialDisplayName={profile?.display_name ?? ""} />
        </CardContent>
      </Card>
    </main>
  );
}
