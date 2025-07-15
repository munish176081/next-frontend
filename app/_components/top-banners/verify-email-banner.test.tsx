import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { VerifyEmailBanner } from "./verify-email-banner";
import { useUser } from "@/_services/hooks/user/use-user";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { useLocalStorage } from "usehooks-ts";
import { toast } from "@/_hooks/use-toast";

// Mocking dependencies
jest.mock("@/_services/hooks/useUser");
jest.mock("@/_services/hooks/auth/useRequestEmailVerifyCode");
jest.mock("usehooks-ts");
jest.mock("@/_hooks/use-toast");

const dateMinus11Minutes = +new Date() - 11 * 60 * 1000;
const datePlus11Minutes = +new Date() + 11 * 60 * 1000;

describe("VerifyEmailBanner", () => {
  const mockUser = { status: "active", createdAt: new Date().toISOString() };

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({ data: mockUser });
    (useRequestEmailVerifyCode as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
    });
    (useLocalStorage as jest.Mock).mockReturnValue([
      undefined,
      jest.fn(),
      jest.fn(),
    ]);
    (toast as jest.Mock).mockImplementation(jest.fn());
  });

  it("should not return banner if user is active", () => {
    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    render(<VerifyEmailBanner />);
    expect(screen.queryByText("Verify here")).toBeNull();
  });

  it("should not return banner if no user", () => {
    (useUser as jest.Mock).mockReturnValue({ data: null });
    render(<VerifyEmailBanner />);
    expect(screen.queryByText("Verify here")).toBeNull();
  });

  it("should return banner for new users (less than 10 minutes ago) with different message", () => {
    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "not_verified",
        createdAt: new Date().toISOString(),
      },
    });
    render(<VerifyEmailBanner />);
    expect(screen.queryByText("Please check your inbox.")).toBeInTheDocument();
    expect(screen.queryByText("Verify here")).toBeNull(); // Resend option should not be available for new users
  });

  it("should return banner for older users (more than 10 minutes ago) with resend option", () => {
    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "not_verified",
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    render(<VerifyEmailBanner />);
    expect(screen.queryByText("Verify here")).toBeInTheDocument();
  });

  it("should not return banner if user is not verified and created more than 10 minutes ago but hide time is set and is in the future", () => {
    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "not_verified",
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    (useLocalStorage as jest.Mock).mockReturnValue([
      datePlus11Minutes,
      jest.fn(),
      jest.fn(),
    ]);

    render(<VerifyEmailBanner />);
    expect(screen.queryByText("Verify here")).toBeNull();
  });

  it("should return banner if user is not verified, created more than 10 minutes ago, hide time is set and is in the past", () => {
    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "not_verified",
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    (useLocalStorage as jest.Mock).mockReturnValue([
      dateMinus11Minutes,
      jest.fn(),
      jest.fn(),
    ]);

    render(<VerifyEmailBanner />);
    expect(screen.queryByText("Verify here")).toBeInTheDocument();
  });

  it("should call removeItem if banner is displayed", () => {
    const mockRemoveItem = jest.fn();

    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "not_verified",
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    (useLocalStorage as jest.Mock).mockReturnValue([
      dateMinus11Minutes,
      jest.fn(),
      mockRemoveItem,
    ]);

    render(<VerifyEmailBanner />);

    expect(mockRemoveItem).toHaveBeenCalled();
  });

  it("should not call removeItem if hideTillTime is not set", () => {
    const mockRemoveItem = jest.fn();

    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "not_verified",
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    (useLocalStorage as jest.Mock).mockReturnValue([
      undefined,
      jest.fn(),
      mockRemoveItem,
    ]);

    render(<VerifyEmailBanner />);

    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it("should call removeItem if hideTillTime is set and user is verified", () => {
    const mockRemoveItem = jest.fn();

    (useUser as jest.Mock).mockReturnValue({
      data: {
        ...mockUser,
        status: "active",
        createdAt: new Date(dateMinus11Minutes).toISOString(),
      },
    });

    (useLocalStorage as jest.Mock).mockReturnValue([
      dateMinus11Minutes,
      jest.fn(),
      mockRemoveItem,
    ]);

    render(<VerifyEmailBanner />);

    expect(mockRemoveItem).toHaveBeenCalled();
  });
});
