describe("Configuration Jest", () => {
  it("additionne correctement", () => {
    expect(1 + 1).toBe(2);
  });

  it("manipule les chaînes", () => {
    const recu = `ARTM-2026-03-1`;
    expect(recu).toContain("ARTM");
    expect(recu.startsWith("ARTM")).toBe(true);
  });
});