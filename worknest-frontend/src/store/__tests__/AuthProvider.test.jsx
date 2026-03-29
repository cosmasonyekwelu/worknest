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

function renderAuthProvider(pathname = "/jobs") {
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
  let getItemSpy;
  let setItemSpy;
  let removeItemSpy;

  beforeEach(() => {
    axiosMock = new MockAdapter(axiosInstance);
    vi.spyOn(console, "log").mockImplementation(() => {});
    getItemSpy = vi.spyOn(Storage.prototype, "getItem");
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
    vi.restoreAllMocks();
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

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("initial-token");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("user-1");
    });

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);

    const response = await axiosInstance.get("/jobs/protected");
    expect(response.data.status).toBe("retried");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("refreshed-token");
    });

    expect(refreshAccessToken).toHaveBeenCalledTimes(2);
    expect(getAuthenticatedUser).toHaveBeenCalledWith("initial-token");
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();
  });

  it("logs out when the refresh attempt fails", async () => {
    vi.mocked(refreshAccessToken)
      .mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "initial-token",
          },
        },
      })
      .mockRejectedValueOnce(new Error("refresh failed"));

    axiosMock.onGet("/jobs/protected").reply(401, { message: "expired" });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("initial-token");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("user-1");
    });

    expect(refreshAccessToken).toHaveBeenCalled();

    await expect(axiosInstance.get("/jobs/protected")).rejects.toThrow("refresh failed");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent('"accessToken":null');
      expect(screen.getByTestId("auth-state")).toHaveTextContent('"userId":null');
    });

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();
  });

  it("restores an admin session on load without relying on the current path", async () => {
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

    renderAuthProvider("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("admin-token");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("admin-1");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("admin");
    });

    expect(refreshAccessToken).toHaveBeenCalled();
    expect(refreshAdminAccessToken).toHaveBeenCalled();
    expect(getAuthenticatedAdmin).toHaveBeenCalledWith("admin-token");
  });
});
