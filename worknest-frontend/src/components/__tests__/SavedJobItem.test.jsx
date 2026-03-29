import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SavedJobItem from "../SavedJobItem";

describe("SavedJobItem", () => {
  it("renders the company logo from companyLogo without depending on avatar", () => {
    render(
      <MemoryRouter>
        <SavedJobItem
          job={{
            _id: "job-1",
            title: "Frontend Engineer",
            companyName: "WorkNest",
            createdAt: "2026-03-29T10:00:00.000Z",
            companyLogo: "https://cdn.example.com/company-logo.webp",
            avatar: "https://cdn.example.com/legacy-avatar.webp",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: "WorkNest" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/company-logo.webp",
    );
  });
});
