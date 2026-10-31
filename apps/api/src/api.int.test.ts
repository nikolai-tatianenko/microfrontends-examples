import { createApp } from "./app";

const yoga = createApp();

async function gql<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
) {
  const response = await yoga.fetch("http://api.test/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string; extensions?: { code?: string } }>;
  };
}

describe("GraphQL API (over HTTP, in process)", () => {
  it("serves posts from the posts module, honouring limit", async () => {
    const { data } = await gql<{
      posts: Array<{ id: string; imageUrl: string }>;
    }>("{ posts(limit: 2) { id imageUrl } }");
    expect(data?.posts).toHaveLength(2);
    expect(data?.posts[0]?.imageUrl).toMatch(/^data:image\/svg\+xml/);
  });

  it("serves plans and exactly one highlighted tier", async () => {
    const { data } = await gql<{ plans: Array<{ highlighted: boolean }> }>(
      "{ plans { id highlighted } }",
    );
    expect(data?.plans.filter((p) => p.highlighted)).toHaveLength(1);
  });

  it("serves analytics stats and activity", async () => {
    const { data } = await gql<{ stats: unknown[]; recentActivity: unknown[] }>(
      "{ stats { id } recentActivity(limit: 1) { id } }",
    );
    expect(data?.stats.length).toBeGreaterThan(0);
    expect(data?.recentActivity).toHaveLength(1);
  });

  describe("auth", () => {
    const signIn =
      "mutation($e:String!,$p:String!){ signIn(email:$e,password:$p){ email } }";
    const signUp =
      "mutation($e:String!,$p:String!){ signUp(email:$e,password:$p){ email } }";

    it("signs in the seeded demo user, case-insensitively", async () => {
      const { data } = await gql<{ signIn: { email: string } }>(signIn, {
        e: "Demo@Example.com",
        p: "password123",
      });
      expect(data?.signIn.email).toBe("demo@example.com");
    });

    it("rejects a wrong password as UNAUTHENTICATED without revealing which part was wrong", async () => {
      const { errors } = await gql(signIn, {
        e: "demo@example.com",
        p: "wrong-password",
      });
      expect(errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
      expect(errors?.[0]?.message).toBe("Invalid email or password.");
    });

    it("rejects malformed input as BAD_USER_INPUT", async () => {
      const bad = await gql(signIn, { e: "not-an-email", p: "password123" });
      const short = await gql(signIn, { e: "demo@example.com", p: "short" });
      expect(bad.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
      expect(short.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
    });

    it("signs up a new user once, then refuses a duplicate", async () => {
      const email = `new-${Date.now()}@example.com`;
      expect(
        (await gql(signUp, { e: email, p: "password123" })).errors,
      ).toBeUndefined();
      expect(
        (await gql(signUp, { e: email, p: "password123" })).errors?.[0]
          ?.message,
      ).toMatch(/already exists/);
      expect(
        (await gql(signIn, { e: email, p: "password123" })).errors,
      ).toBeUndefined();
    });
  });
});
