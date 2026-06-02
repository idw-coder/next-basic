"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface QuizCategory {
  id: number;
  slug: string;
  category_name: string;
  description?: string;
  display_order?: number;
}

export default function QuizCategoryManagePage() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.get("/api/quiz/categories");
      setCategories(res.data);
      setLoading(false);
    })();
  }, []);

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    try {
      const res = await api.post("/api/quiz/categories", {
        slug: newSlug.trim(),
        category_name: newName.trim(),
        ...(newDescription.trim() ? { description: newDescription.trim() } : {}),
        ...(newDisplayOrder ? { display_order: Number(newDisplayOrder) } : {}),
      });
      setCategories((prev) => [...prev, res.data]);
      setNewSlug("");
      setNewName("");
      setNewDescription("");
      setNewDisplayOrder("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat: QuizCategory) => {
    setEditingId(cat.id);
    setEditSlug(cat.slug);
    setEditName(cat.category_name);
    setEditDescription(cat.description ?? "");
    setEditDisplayOrder(cat.display_order?.toString() ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdate = async (id: number) => {
    setError(null);
    setSaving(true);
    try {
      const res = await api.put(`/api/quiz/categories/${id}`, {
        slug: editSlug.trim(),
        category_name: editName.trim(),
        description: editDescription.trim(),
        ...(editDisplayOrder ? { display_order: Number(editDisplayOrder) } : {}),
      });
      setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      cancelEdit();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このカテゴリーを削除しますか？")) return;
    setError(null);
    try {
      await api.delete(`/api/quiz/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("削除に失敗しました");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">カテゴリー管理</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium mb-3">カテゴリー追加</h2>
          <div className="flex flex-wrap gap-2">
            <Input
              className="w-40"
              placeholder="slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
            />
            <Input
              className="w-48"
              placeholder="カテゴリー名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              className="flex-1 min-w-[200px]"
              placeholder="説明（任意）"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Input
              className="w-24"
              type="number"
              placeholder="表示順"
              value={newDisplayOrder}
              onChange={(e) => setNewDisplayOrder(e.target.value)}
            />
            <Button
              disabled={!newSlug.trim() || !newName.trim() || creating}
              onClick={handleCreate}
            >
              {creating ? "追加中..." : "追加"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-auto">
          {loading && (
            <div className="h-1 bg-blue-500 animate-pulse" />
          )}
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="px-3 py-2 text-left w-16">順</th>
                <th className="px-3 py-2 text-left w-36">slug</th>
                <th className="px-3 py-2 text-left w-44">カテゴリー名</th>
                <th className="px-3 py-2 text-left">説明</th>
                <th className="px-3 py-2 text-left w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-3 py-1">
                        <Input
                          className="w-14 h-8"
                          type="number"
                          value={editDisplayOrder}
                          onChange={(e) => setEditDisplayOrder(e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-1">
                        <Input
                          className="h-8"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-1">
                        <Input
                          className="h-8"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-1">
                        <Input
                          className="h-8"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-1">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={saving}
                            onClick={() => handleUpdate(cat.id)}
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
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-gray-500">
                        {cat.display_order ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{cat.slug}</td>
                      <td className="px-3 py-2">{cat.category_name}</td>
                      <td className="px-3 py-2 text-gray-500">
                        {cat.description || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEdit(cat)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {categories.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-400 py-8"
                  >
                    カテゴリーがまだありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
