import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("loads lesson content and highlight count", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "intro",
          title: "Introduction to JavaScript Functions",
          content: "<p>Functions are reusable blocks of code.</p>",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(screen.getByText("Loading lesson...")).toBeInTheDocument();
    await screen.findByText("Introduction to JavaScript Functions");
    expect(screen.getByText("0 stored for this lesson")).toBeInTheDocument();
  });

  it("shows an error message when lesson fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network down")));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Network down")).toBeInTheDocument();
    });
  });
});
