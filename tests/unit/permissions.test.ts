import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";

describe("can", () => {
  it("lets admins do everything", () => {
    for (const action of ["product:view", "product:create", "product:edit", "product:status", "product:delete"] as const) {
      expect(can("ADMIN", action)).toBe(true);
    }
  });

  it("lets managers manage products but not delete them", () => {
    expect(can("MANAGER", "product:view")).toBe(true);
    expect(can("MANAGER", "product:create")).toBe(true);
    expect(can("MANAGER", "product:edit")).toBe(true);
    expect(can("MANAGER", "product:status")).toBe(true);
    expect(can("MANAGER", "product:delete")).toBe(false);
  });
});
