import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiErrors";

describe("getApiErrorMessage", () => {
  it("returns the fallback for non-axios errors", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("returns the first nested message from axios validation errors", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          status: "error",
          message: "Validation failed.",
          errors: {
            email: ["Enter a valid email address."],
          },
        },
      },
    };

    expect(axios.isAxiosError(error)).toBe(true);
    expect(getApiErrorMessage(error)).toBe("Enter a valid email address.");
  });

  it("prefers the response message when there are no field errors", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          status: "error",
          message: "Not allowed.",
        },
      },
    };

    expect(getApiErrorMessage(error)).toBe("Not allowed.");
  });

  it("falls back when the axios error has no response payload", () => {
    const error = {
      isAxiosError: true,
    };

    expect(getApiErrorMessage(error, "Fallback message")).toBe("Fallback message");
  });
});
