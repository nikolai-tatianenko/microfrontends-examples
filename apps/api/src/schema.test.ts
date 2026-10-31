import { printSchema } from "graphql";
import { modules, schema } from "./schema";
import { cover } from "./modules/posts/cover";

describe("schema assembly", () => {
  it("merges every module's types into one valid schema", () => {
    const sdl = printSchema(schema);
    for (const type of ["Post", "Plan", "Stat", "Activity", "AuthPayload"])
      expect(sdl).toContain(`type ${type}`);
  });

  it("exposes each module's queries on the shared Query root", () => {
    const fields = Object.keys(schema.getQueryType()?.getFields() ?? {});
    expect(fields).toEqual(
      expect.arrayContaining(["posts", "plans", "stats", "recentActivity"]),
    );
  });

  it("registers four independent modules", () => {
    expect(modules).toHaveLength(4);
  });
});

describe("cover", () => {
  it("is deterministic per seed and differs between seeds", () => {
    expect(cover("1")).toBe(cover("1"));
    expect(cover("1")).not.toBe(cover("2"));
  });
});
