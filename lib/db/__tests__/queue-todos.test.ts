import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { __resetDbForTests } from "../db";
import { QueueRepository, ResearchQueueRequiresTodoError } from "../queue";
import { TodoRepository } from "../todos";

function fresh(name: string) {
  const db = __resetDbForTests(name + "_" + Math.random().toString(36).slice(2));
  return { queue: new QueueRepository(db), todos: new TodoRepository(db) };
}

describe("queue", () => {
  it("creates a Leisure item without a todo", async () => {
    const { queue } = fresh("q1");
    const item = await queue.create({
      url: "https://x",
      title: "Hello",
      tag: "leisure",
    });
    expect(item.tag).toBe("leisure");
    expect(item.status).toBe("saved");
  });

  it("rejects a Research item without a linkedTodoId", async () => {
    const { queue } = fresh("q2");
    await expect(
      queue.create({ url: "https://x", title: "Hello", tag: "research" }),
    ).rejects.toBeInstanceOf(ResearchQueueRequiresTodoError);
  });

  it("creates a Research item linked to a todo", async () => {
    const { queue, todos } = fresh("q3");
    const todo = await todos.create({ title: "T" });
    const item = await queue.create({
      url: "https://x",
      title: "Y",
      tag: "research",
      linkedTodoId: todo.id,
    });
    expect(item.tag).toBe("research");
    expect(item.linkedTodoId).toBe(todo.id);
  });

  it("listByTag groups items", async () => {
    const { queue, todos } = fresh("q4");
    const todo = await todos.create({ title: "T" });
    await queue.create({ url: "a", title: "a", tag: "leisure" });
    await queue.create({
      url: "b",
      title: "b",
      tag: "research",
      linkedTodoId: todo.id,
    });
    expect(await queue.listByTag("leisure")).toHaveLength(1);
    expect(await queue.listByTag("research")).toHaveLength(1);
  });

  it("markConsumed flips status", async () => {
    const { queue } = fresh("q5");
    const item = await queue.create({ url: "x", title: "x", tag: "leisure" });
    await queue.markConsumed(item.id);
    const fresh1 = await queue.get(item.id);
    expect(fresh1?.status).toBe("consumed");
  });
});

describe("todos", () => {
  it("creates and updates", async () => {
    const { todos } = fresh("t1");
    const todo = await todos.create({ title: "ship demo" });
    const updated = await todos.update(todo.id, { status: "done" });
    expect(updated.status).toBe("done");
    expect(updated.completedAt).toBeDefined();
  });

  it("listByStatus filters", async () => {
    const { todos } = fresh("t2");
    await todos.create({ title: "a" });
    const t = await todos.create({ title: "b" });
    await todos.update(t.id, { status: "in-progress" });
    expect(await todos.listByStatus("pending")).toHaveLength(1);
    expect(await todos.listByStatus("in-progress")).toHaveLength(1);
  });
});
