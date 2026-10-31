import type { Services } from "@blog/contract";
import { loadDashboard } from "./data";

const clientReturning = (result: object) =>
  ({
    query: jest.fn().mockResolvedValue(result),
  }) as unknown as Services["apollo"] & { query: jest.Mock };

describe("loadDashboard", () => {
  it("asks for the requested number of activity rows and returns the data", async () => {
    const apollo = clientReturning({ data: { stats: [], recentActivity: [] } });
    await expect(loadDashboard(apollo, 2)).resolves.toEqual({
      stats: [],
      recentActivity: [],
    });
    expect(apollo.query).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { activityLimit: 2 } }),
    );
  });

  it("throws the GraphQL error so the view can show it", async () => {
    const apollo = clientReturning({
      data: undefined,
      error: new Error("boom"),
    });
    await expect(loadDashboard(apollo)).rejects.toThrow("boom");
  });
});
