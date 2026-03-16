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
});
