"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { fetchNextApiJson } from "@/lib/nextApiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";

interface QuizTag {
  id: number;
  slug: string;
  name: string;
}

interface QuizTagDetail extends QuizTag {
  quizCount: number;
}

interface BulkImportResult {
  created: QuizTag[];
  skipped: string[];
  failed: { slug: string; error: string }[];
}

function parseBulkTags(json: string): Pick<QuizTag, "slug" | "name">[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error("JSONは配列で入力してください");
  }

  return parsed.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`${index + 1}件目がオブジェクトではありません`);
    }
    const tag = item as { slug?: unknown; name?: unknown; label?: unknown };
    const rawName = tag.name ?? tag.label;
    if (typeof tag.slug !== "string" || typeof rawName !== "string") {
      throw new Error(`${index + 1}件目のslug/nameまたはlabelが文字列ではありません`);
    }
    const slug = tag.slug.trim();
    const name = rawName.trim();
    if (!slug || !name) {
      throw new Error(`${index + 1}件目のslug/nameまたはlabelが空です`);
    }
    return { slug, name };
  });
}

export default function QuizTagManagePage() {
  const [tags, setTags] = useState<QuizTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [bulkJson, setBulkJson] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.slug.localeCompare(b.slug, "ja")),
    [tags]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const tags = await fetchNextApiJson<QuizTag[]>("/next-api/quiz/tags");
      setTags(tags);
      setLoading(false);
    })();
  }, []);

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    try {
      const res = await api.post("/api/quiz/tags", {
        slug: newSlug.trim(),
        name: newName.trim(),
      });
      setTags((prev) => [...prev, res.data]);
      setNewSlug("");
      setNewName("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg ?? "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const handleBulkCreate = async () => {
    setError(null);
    setBulkResult(null);

    let parsedTags: Pick<QuizTag, "slug" | "name">[];
    try {
      parsedTags = parseBulkTags(bulkJson);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "JSONの解析に失敗しました");
      return;
    }

    setBulkImporting(true);
    const existingSlugs = new Set(tags.map((tag) => tag.slug));
    const inputSlugs = new Set<string>();
    const created: QuizTag[] = [];
    const skipped: string[] = [];
    const failed: { slug: string; error: string }[] = [];

    try {
      for (const tag of parsedTags) {
        if (existingSlugs.has(tag.slug) || inputSlugs.has(tag.slug)) {
          skipped.push(tag.slug);
          continue;
        }
        inputSlugs.add(tag.slug);

        try {
          const res = await api.post("/api/quiz/tags", tag);
          created.push(res.data);
          existingSlugs.add(tag.slug);
        } catch (e: unknown) {
          const msg = (e as { response?: { data?: { error?: string } } })
            ?.response?.data?.error;
          failed.push({ slug: tag.slug, error: msg ?? "作成に失敗しました" });
        }
      }

      if (created.length > 0) {
        setTags((prev) => [...prev, ...created]);
      }
      setBulkResult({ created, skipped, failed });
      if (failed.length === 0 && created.length > 0) {
        setBulkJson("");
      }
    } finally {
      setBulkImporting(false);
    }
  };

  const startEdit = (tag: QuizTag) => {
    setEditingId(tag.id);
    setEditSlug(tag.slug);
    setEditName(tag.name);
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdate = async (id: number) => {
    setError(null);
    setSaving(true);
    try {
      const res = await api.put(`/api/quiz/tags/${id}`, {
        slug: editSlug.trim(),
        name: editName.trim(),
      });
      setTags((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      cancelEdit();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: QuizTag) => {
    setError(null);
    setDeletingId(tag.id);

    try {
      const res = await api.get<QuizTagDetail>(`/api/quiz/tags/${tag.id}`);
      const quizCount = res.data.quizCount ?? 0;
      const confirmed =
        quizCount > 0
          ? confirm(
              `タグ「${tag.name}」は ${quizCount} 件のクイズに紐づいています。\n` +
                "このタグをクイズから外したうえで削除しますか？"
            )
          : confirm(`タグ「${tag.name}」を削除しますか？`);

      if (!confirmed) return;

      await api.delete(`/api/quiz/tags/${tag.id}`);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      const msg = (e as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      if (status === 409) {
        setError(
          "このタグはクイズに紐づいているため削除できません。API側の削除処理を更新してください。"
        );
      } else {
        setError(msg ?? "削除に失敗しました");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">タグ管理</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium mb-3">新規タグ</h2>
          <div className="flex gap-2">
            <Input
              className="w-40"
              placeholder="slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Input
              className="flex-1"
              placeholder="名前"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button
              disabled={!newSlug.trim() || !newName.trim() || creating}
              onClick={handleCreate}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {creating ? "追加中..." : "追加"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium">JSON一括追加</h2>
              <p className="mt-1 text-xs text-gray-500">
                形式: [{"{\"slug\":\"example\",\"name\":\"表示名\"}"}] または [{"{\"slug\":\"example\",\"label\":\"表示名\"}"}]
              </p>
            </div>
            <Button
              disabled={!bulkJson.trim() || bulkImporting}
              onClick={handleBulkCreate}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {bulkImporting ? "追加中..." : "一括追加"}
            </Button>
          </div>
          <textarea
            className="min-h-40 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={`[
  { "slug": "css-flexbox", "name": "Flexbox" },
  { "slug": "js-promise", "name": "Promise" }
]`}
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
          />
          {bulkResult && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">作成 {bulkResult.created.length}</Badge>
              <Badge variant="outline">スキップ {bulkResult.skipped.length}</Badge>
              <Badge variant={bulkResult.failed.length > 0 ? "destructive" : "outline"}>
                失敗 {bulkResult.failed.length}
              </Badge>
              {bulkResult.failed.length > 0 && (
                <div className="basis-full text-red-600">
                  {bulkResult.failed.map((item) => (
                    <div key={item.slug}>
                      {item.slug}: {item.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium">タグ一覧</h2>
            <Badge variant="secondary">{tags.length}</Badge>
          </div>
          {loading && <div className="h-1 bg-blue-500 animate-pulse mb-2" />}
          <div className="space-y-1">
            {sortedTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 py-1.5 border-b last:border-0"
              >
                {editingId === tag.id ? (
                  <>
                    <Input
                      className="w-40 h-8"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                    />
                    <Input
                      className="flex-1 h-8"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={saving}
                      onClick={() => handleUpdate(tag.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={cancelEdit}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="secondary"
                      className="min-w-[120px] justify-center"
                    >
                      {tag.slug}
                    </Badge>
                    <span className="flex-1">{tag.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEdit(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      disabled={deletingId === tag.id}
                      onClick={() => handleDelete(tag)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            {tags.length === 0 && !loading && (
              <div className="text-center text-gray-400 py-8">
                タグがまだありません
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
