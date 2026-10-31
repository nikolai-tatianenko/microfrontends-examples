import { graphql } from "./gql";

export const DashboardQuery = graphql(`
  query Dashboard($activityLimit: Int) {
    stats {
      id
      label
      value
      deltaPct
    }
    recentActivity(limit: $activityLimit) {
      id
      user
      action
      at
    }
  }
`);
