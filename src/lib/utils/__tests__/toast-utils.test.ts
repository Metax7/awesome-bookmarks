import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock sonner before importing ToastManager
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

import { ToastManager } from "../toast-utils";

describe("ToastManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows success toast with correct message", async () => {
    const { toast } = await vi.importMock<typeof import("sonner")>("sonner");

    ToastManager.success("Success message");

    expect(toast.success).toHaveBeenCalledWith("Success message", {
      duration: 4000,
      action: undefined,
    });
  });

  it("shows error toast with retry action", async () => {
    const { toast } = await vi.importMock<typeof import("sonner")>("sonner");
    const retryFn = vi.fn();

    ToastManager.errorWithRetry("Error message", retryFn, "Retry");

    expect(toast.error).toHaveBeenCalledWith("Error message", {
      duration: 8000,
      action: {
        label: "Retry",
        onClick: expect.any(Function),
      },
    });
  });

  it("shows network error toast", async () => {
    const { toast } = await vi.importMock<typeof import("sonner")>("sonner");

    ToastManager.networkError();

    expect(toast.error).toHaveBeenCalledWith(
      "Network error. Please check your internet connection.",
      { duration: 6000, action: undefined }
    );
  });

  it("shows validation error toast", async () => {
    const { toast } = await vi.importMock<typeof import("sonner")>("sonner");

    ToastManager.validationError("Custom validation message");

    expect(toast.error).toHaveBeenCalledWith("Custom validation message", {
      duration: 5000,
    });
  });

  it("shows server error with retry", async () => {
    const { toast } = await vi.importMock<typeof import("sonner")>("sonner");
    const retryFn = vi.fn();

    ToastManager.serverError(retryFn);

    expect(toast.error).toHaveBeenCalledWith(
      "Server error. Please try again later.",
      {
        duration: 8000,
        action: {
          label: "Retry",
          onClick: expect.any(Function),
        },
      }
    );
  });

  it("handles promise-based toasts", async () => {
    const { toast } = await vi.importMock<typeof import("sonner")>("sonner");
    const promise = Promise.resolve("success");

    await ToastManager.promise(promise, {
      loading: "Loading...",
      success: "Success!",
      error: "Error!",
    });

    expect(toast.promise).toHaveBeenCalledWith(promise, {
      loading: "Loading...",
      success: "Success!",
      error: "Error!",
    });
  });
});
