"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
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

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.slug.localeCompare(b.slug, "ja")),
    [tags]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.get("/api/quiz/tags");
      setTags(res.data);
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

  const handleDelete = async (id: number) => {
    if (!confirm("このタグを削除しますか？")) return;
    setError(null);
    try {
      await api.delete(`/api/quiz/tags/${id}`);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("削除に失敗しました");
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(tag.id)
                      }
                    />
                    <Input
                      className="flex-1 h-8"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(tag.id)
                      }
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
                      onClick={() => handleDelete(tag.id)}
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
