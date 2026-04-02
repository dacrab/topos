import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useImageUpload } from "./useImageUpload";

describe("useImageUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => "blob:preview");
    global.URL.revokeObjectURL = vi.fn();
  });

  function createChangeEvent(file?: File) {
    return {
      target: {
        files: file ? [file] : [],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
  }

  it("rejects non-image files", () => {
    const { result } = renderHook(() => useImageUpload({ uploadType: "logo" }));
    const file = new File(["test"], "doc.txt", { type: "text/plain" });

    act(() => {
      result.current.handleSelect(createChangeEvent(file));
    });

    expect(toast.error).toHaveBeenCalledWith("Please select an image file");
    expect(result.current.hasFile).toBe(false);
    expect(result.current.preview).toBe("");
  });

  it("rejects files larger than max size", () => {
    const { result } = renderHook(() => useImageUpload({ uploadType: "logo", maxSizeMB: 1 }));
    const file = new File([new Uint8Array(1024)], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 2 * 1024 * 1024 });

    act(() => {
      result.current.handleSelect(createChangeEvent(file));
    });

    expect(toast.error).toHaveBeenCalledWith("File too large (max 1MB)");
    expect(result.current.hasFile).toBe(false);
  });

  it("creates preview for valid images and removes it cleanly", () => {
    const { result } = renderHook(() => useImageUpload({ uploadType: "user" }));
    const file = new File(["img"], "avatar.png", { type: "image/png" });

    act(() => {
      result.current.handleSelect(createChangeEvent(file));
    });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(result.current.hasFile).toBe(true);
    expect(result.current.preview).toBe("blob:preview");

    act(() => {
      result.current.remove();
    });

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(result.current.hasFile).toBe(false);
    expect(result.current.preview).toBe("");
  });

  it("returns existing preview when nothing new was selected", async () => {
    const { result } = renderHook(() =>
      useImageUpload({ uploadType: "logo", initialUrl: "https://cdn.test/logo.png" }),
    );

    await expect(result.current.upload()).resolves.toBe("https://cdn.test/logo.png");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("uploads selected image and stores returned url", async () => {
    const { result } = renderHook(() => useImageUpload({ uploadType: "listing" }));
    const file = new File(["img"], "listing.png", { type: "image/png" });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://cdn.test/listing.png" }),
    } as Response);

    act(() => {
      result.current.handleSelect(createChangeEvent(file));
    });

    await act(async () => {
      await expect(result.current.upload()).resolves.toBe("https://cdn.test/listing.png");
    });

    expect(global.fetch).toHaveBeenCalledOnce();
    expect(result.current.hasFile).toBe(false);
    expect(result.current.preview).toBe("https://cdn.test/listing.png");
  });

  it("throws the api error message when upload fails", async () => {
    const { result } = renderHook(() => useImageUpload({ uploadType: "listing" }));
    const file = new File(["img"], "listing.png", { type: "image/png" });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Upload exploded" }),
    } as Response);

    act(() => {
      result.current.handleSelect(createChangeEvent(file));
    });

    await expect(result.current.upload()).rejects.toThrow("Upload exploded");
  });
});
