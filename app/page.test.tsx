import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

test("홈 화면은 URL 입력과 빈 상태를 보여주고, 입력이 비면 변환할 수 없다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Markdown");
  expect(screen.getByLabelText("페이지 URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환" })).toBeDisabled();
  expect(screen.getByText("아직 변환한 페이지가 없어요")).toBeInTheDocument();
});
