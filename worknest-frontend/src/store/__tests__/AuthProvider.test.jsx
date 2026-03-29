import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { useAuth } from "..";
import axiosInstance from "@/utils/axiosInstance";
import { getAuthenticatedUser, refreshAccessToken } from "@/api/api";
import {
  getAuthenticatedAdmin,
  refreshAdminAccessToken,
} from "@/api/admin";

vi.mock("@/api/api", () => ({
  getAuthenticatedUser: vi.fn(),
  refreshAccessToken: vi.fn(),
}));

vi.mock("@/api/admin", () => ({
  getAuthenticatedAdmin: vi.fn(),
  refreshAdminAccessToken: vi.fn(),
}));

function AuthStateViewer() {
  const { accessToken, user } = useAuth();

  return (
    <div data-testid="auth-state">
      {JSON.stringify({
        accessToken,
        userId: user?.id ?? user?._id ?? null,
        role: user?.role ?? null,
      })}
    </div>
  );
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function renderAuthProvider(pathname = "/jobs") {
  window.history.replaceState({}, "", pathname);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,
        retry: false,
      },
    },
  });

  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthStateViewer />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("AuthProvider", () => {
  let axiosMock;
  let setItemSpy;
  let removeItemSpy;

  beforeEach(() => {
    axiosMock = new MockAdapter(axiosInstance);
    window.sessionStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, "debug").mockImplementation(() => {});
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");

    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      status: 200,
      data: {
        data: {
          id: "user-1",
          role: "applicant",
          isVerified: true,
        },
      },
    });

    vi.mocked(getAuthenticatedAdmin).mockResolvedValue({
      status: 200,
      data: {
        data: {
          id: "admin-1",
          role: "admin",
          isVerified: true,
        },
      },
    });
  });

  afterEach(() => {
    axiosMock.restore();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not fall back to admin refresh on user routes when user refresh fails", async () => {
    window.sessionStorage.setItem("worknest-auth-mode", "admin");

    vi.mocked(refreshAccessToken).mockRejectedValueOnce({
      response: { status: 401 },
    });
    vi.mocked(refreshAdminAccessToken).mockResolvedValueOnce({
      data: {
        data: {
          accessToken: "admin-token",
        },
      },
    });

    renderAuthProvider("/jobs");

    await waitFor(() => {
      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("auth-state")).toHaveTextContent(
        '"accessToken":null',
      );
    });

    expect(refreshAdminAccessToken).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("worknest-auth-mode")).toBeNull();
    expect(removeItemSpy).toHaveBeenCalledWith("worknest-auth-mode");
  });

  it("refreshes admin sessions through the admin endpoint on admin routes", async () => {
    vi.mocked(refreshAdminAccessToken).mockResolvedValueOnce({
      data: {
        data: {
          accessToken: "admin-token",
        },
      },
    });

    renderAuthProvider("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("admin-token");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("admin-1");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("admin");
    });

    expect(refreshAdminAccessToken).toHaveBeenCalledTimes(1);
    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(getAuthenticatedAdmin).toHaveBeenCalledWith("admin-token");
    expect(setItemSpy).toHaveBeenCalledWith("worknest-auth-mode", "admin");
  });

  it("refreshes the access token after a 401 response and retries the request", async () => {
    vi.mocked(refreshAccessToken)
      .mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "initial-token",
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "refreshed-token",
          },
        },
      });

    axiosMock.onGet("/jobs/protected").reply((config) => {
      if (config.headers?.Authorization === "Bearer initial-token") {
        return [401, { message: "expired" }];
      }

      if (config.headers?.Authorization === "Bearer refreshed-token") {
        return [200, { status: "retried" }];
      }

      return [500, { message: "unexpected authorization header" }];
    });

    renderAuthProvider("/jobs");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("initial-token");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("user-1");
    });

    const response = await axiosInstance.get("/jobs/protected");
    expect(response.data.status).toBe("retried");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent(
        "refreshed-token",
      );
    });

    expect(refreshAccessToken).toHaveBeenCalledTimes(2);
    expect(refreshAdminAccessToken).not.toHaveBeenCalled();
    expect(getAuthenticatedUser).toHaveBeenCalledWith("initial-token");
  });

  it("queues concurrent 401 retries behind a single user refresh", async () => {
    const deferredRefresh = createDeferred();

    vi.mocked(refreshAccessToken)
      .mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "initial-token",
          },
        },
      })
      .mockImplementationOnce(() => deferredRefresh.promise);

    const createProtectedReply = (status) => (config) => {
      if (config.headers?.Authorization === "Bearer refreshed-token") {
        return [200, { status }];
      }

      return [401, { message: "expired" }];
    };

    axiosMock.onGet("/jobs/protected-a").reply(createProtectedReply("retried-a"));
    axiosMock.onGet("/jobs/protected-b").reply(createProtectedReply("retried-b"));

    renderAuthProvider("/jobs");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("initial-token");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("user-1");
    });

    const pendingRequests = Promise.all([
      axiosInstance.get("/jobs/protected-a"),
      axiosInstance.get("/jobs/protected-b"),
    ]);

    await waitFor(() => {
      expect(refreshAccessToken).toHaveBeenCalledTimes(2);
    });

    expect(refreshAdminAccessToken).not.toHaveBeenCalled();

    deferredRefresh.resolve({
      data: {
        data: {
          accessToken: "refreshed-token",
        },
      },
    });

    const [firstResponse, secondResponse] = await pendingRequests;

    expect(firstResponse.data.status).toBe("retried-a");
    expect(secondResponse.data.status).toBe("retried-b");
    expect(refreshAccessToken).toHaveBeenCalledTimes(2);
  });
});
