"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConsumeSubtype } from "@/lib/db/types";
import {
  ResearchQueueRequiresTodoError,
  useQueueActions,
  useTodos,
} from "@/lib/store/use-v2";

export default function SharePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading…</p>}>
      <ShareForm />
    </Suspense>
  );
}

function ShareForm() {
  const router = useRouter();
  const params = useSearchParams();
  const todos = useTodos();
  const { create } = useQueueActions();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<ConsumeSubtype>("leisure");
  const [linkedTodoId, setLinkedTodoId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(params.get("title") ?? "");
    const sharedUrl = params.get("url") ?? params.get("text") ?? "";
    setUrl(sharedUrl);
  }, [params]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await create({
        url,
        title: title || url,
        description: description || undefined,
        tag,
        linkedTodoId: tag === "research" ? linkedTodoId : undefined,
      });
      router.push("/#queue");
    } catch (e) {
      if (e instanceof ResearchQueueRequiresTodoError) {
        setError("Research items must be linked to a Create todo. Pick one or change tag to Leisure.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  const activeTodos = todos.filter((t) => t.status !== "done");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Add to queue</h1>
      <div className="grid gap-3 text-sm">
        <label className="grid gap-1">
          <span className="font-medium">URL</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Description</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
        </label>
        <fieldset className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setTag("leisure")} aria-pressed={tag === "leisure"} className={`rounded-full border py-2 text-sm ${tag === "leisure" ? "border-transparent bg-[color:var(--color-consume)] text-white" : "border-[color:var(--color-border)]"}`}>Leisure</button>
          <button type="button" onClick={() => setTag("research")} aria-pressed={tag === "research"} className={`rounded-full border py-2 text-sm ${tag === "research" ? "border-transparent bg-[color:var(--color-create)] text-white" : "border-[color:var(--color-border)]"}`}>Research</button>
        </fieldset>
        {tag === "research" && (
          <label className="grid gap-1">
            <span className="font-medium">Linked todo (required for Research)</span>
            <select value={linkedTodoId ?? ""} onChange={(e) => setLinkedTodoId(e.target.value || undefined)} className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2">
              <option value="">Pick a todo…</option>
              {activeTodos.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </label>
        )}
        {error && <p role="alert" className="rounded-md bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.push("/")} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm">Cancel</button>
        <button type="button" disabled={saving || !url} onClick={handleSave} className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </main>
  );
}
