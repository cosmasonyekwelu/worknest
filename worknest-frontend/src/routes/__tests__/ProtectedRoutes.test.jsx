import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PrivateRoutes } from "../ProtectedRoutes";

function renderPrivateRoute(props, initialEntry = "/settings") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/auth/login" element={<div>Login Page</div>} />
        <Route path="/settings" element={<PrivateRoutes {...props}><div>Settings Page</div></PrivateRoutes>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PrivateRoutes", () => {
  it("redirects unauthenticated users to the login page", async () => {
    renderPrivateRoute({
      accessToken: null,
      isAuthenticating: false,
      user: null,
    });

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  it("renders protected content for authenticated users", async () => {
    renderPrivateRoute({
      accessToken: "valid-token",
      isAuthenticating: false,
      user: {
        id: "user-1",
        role: "user",
        isVerified: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Settings Page")).toBeInTheDocument();
    });
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
