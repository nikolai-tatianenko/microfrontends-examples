import type { Services } from "@blog/contract";
import { DashboardQuery } from "./graphql";

/** Loads everything the dashboard shows in one round trip. Throws with the server's message on failure. */
export async function loadDashboard(
  apollo: Services["apollo"],
  activityLimit = 5,
) {
  const { data, error } = await apollo.query({
    query: DashboardQuery,
    variables: { activityLimit },
  });
  if (error) throw error;
  return data;
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
