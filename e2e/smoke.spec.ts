import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 URL 입력과 빈 상태가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/feedme/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
  await expect(page.getByLabel("페이지 URL")).toBeVisible();
  await expect(page.getByRole("button", { name: "변환" })).toBeDisabled();
  await expect(page.getByText("아직 변환한 페이지가 없어요")).toBeVisible();
});
