import { schema } from "@blog/api/schema";
import { createSchemaClient } from "@blog/apollo/testing";
import { loadDashboard } from "./data";

describe("dashboard data (real API schema)", () => {
  it("loads stats and a limited activity feed in one query", async () => {
    const data = await loadDashboard(createSchemaClient(schema), 2);
    expect(data.stats.map((s) => s.id)).toEqual([
      "visitors",
      "signups",
      "revenue",
      "churn",
    ]);
    expect(data.recentActivity).toHaveLength(2);
    expect(data.stats[0]).toEqual(
      expect.objectContaining({
        label: "Visitors",
        deltaPct: expect.any(Number),
      }),
    );
  });
});
