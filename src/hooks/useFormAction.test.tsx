"use client";

import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { useFormAction } from "./useFormAction";

describe("useFormAction", () => {
  it("starts with isPending false", () => {
    const { result } = renderHook(() => useFormAction());
    expect(result.current.isPending).toBe(false);
  });

  it("calls toast.success on success", async () => {
    const action = vi.fn().mockResolvedValue({ success: true, message: "Saved!" });
    const { result } = renderHook(() => useFormAction());

    const handler = result.current.execute(action);
    await act(async () => {
      await handler(new FormData());
    });

    expect(action).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith("Saved!");
  });

  it("calls toast.error on failure", async () => {
    const action = vi.fn().mockResolvedValue({ success: false, message: "Something broke" });
    const { result } = renderHook(() => useFormAction());

    const handler = result.current.execute(action);
    await act(async () => {
      await handler(new FormData());
    });

    expect(toast.error).toHaveBeenCalledWith("Something broke");
  });

  it("calls onSuccess callback only on success", async () => {
    const onSuccess = vi.fn();
    const successAction = vi.fn().mockResolvedValue({ success: true, message: "Done" });
    const failAction = vi.fn().mockResolvedValue({ success: false, message: "Fail" });
    const { result } = renderHook(() => useFormAction());

    await act(async () => {
      await result.current.execute(successAction, onSuccess)(new FormData());
    });
    expect(onSuccess).toHaveBeenCalledOnce();

    await act(async () => {
      await result.current.execute(failAction, onSuccess)(new FormData());
    });
    expect(onSuccess).toHaveBeenCalledOnce(); // still only once
  });

  it("passes formData to the action", async () => {
    const action = vi.fn().mockResolvedValue({ success: true, message: "ok" });
    const { result } = renderHook(() => useFormAction());
    const fd = new FormData();
    fd.set("name", "Alice");

    await act(async () => {
      await result.current.execute(action)(fd);
    });

    expect(action).toHaveBeenCalledWith(fd);
  });

  it("calls toast.error when action throws", async () => {
    const action = vi.fn().mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() => useFormAction());

    await act(async () => {
      await result.current.execute(action)(new FormData());
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it("supports preparing form data before the action runs", async () => {
    const action = vi.fn().mockResolvedValue({ success: true, message: "Saved!" });
    const prepare = vi.fn(async (fd: FormData) => {
      fd.set("image", "uploaded-url");
      return undefined;
    });
    const { result } = renderHook(() => useFormAction());
    const fd = new FormData();

    await act(async () => {
      await result.current.execute(action, { prepare })(fd);
    });

    expect(prepare).toHaveBeenCalledWith(fd);
    expect(action).toHaveBeenCalledWith(fd);
    expect(fd.get("image")).toBe("uploaded-url");
  });

  it("uses custom errorMessage when prepare throws", async () => {
    const action = vi.fn();
    const { result } = renderHook(() => useFormAction());

    await act(async () => {
      await result.current.execute(action, {
        prepare: async () => {
          throw new Error("Upload failed badly");
        },
        errorMessage: "Upload failed",
      })(new FormData());
    });

    expect(action).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Upload failed");
  });

  it("sets isPending true during execution then false after", async () => {
    let resolveAction: ((v: { success: boolean; message: string }) => void) | undefined;
    const action = vi.fn(
      () =>
        new Promise<{ success: boolean; message: string }>((resolve) => {
          resolveAction = resolve;
        }),
    );
    const { result } = renderHook(() => useFormAction());

    await act(async () => {
      result.current.execute(action)(new FormData());
      await Promise.resolve();
    });

    expect(action).toHaveBeenCalledOnce();
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      resolveAction?.({ success: true, message: "done" });
    });
    expect(result.current.isPending).toBe(false);
  });
});
