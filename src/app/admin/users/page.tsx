"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "管理者",
  user: "ユーザー",
};

export default function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [dialog, setDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUserId(JSON.parse(stored).id);
      } catch { /* ignore */ }
    }
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/users");
        setUsers(res.data.users);
      } catch {
        setError("ユーザーの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const openEdit = (user: User) => {
    setEditTarget(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditError(null);
    setDialog(true);
  };

  const closeEdit = () => {
    setDialog(false);
    setEditTarget(null);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    const name = editName.trim();
    const email = editEmail.trim();
    if (!name || !email) {
      setEditError("名前とメールアドレスは必須です");
      return;
    }
    setSaving(true);
    setEditError(null);
    try {
      const params: Record<string, string> = {};
      if (name !== editTarget.name) params.name = name;
      if (email !== editTarget.email) params.email = email;
      if (editRole !== editTarget.role) params.role = editRole;
      const res = await api.patch(`/api/users/${editTarget.id}`, params);
      setUsers((prev) =>
        prev.map((u) => (u.id === editTarget.id ? res.data : u))
      );
      closeEdit();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setEditError(msg ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      alert("自分自身は削除できません");
      return;
    }
    if (!confirm(`「${user.name}」を削除しますか？`)) return;
    await api.delete(`/api/users/${user.id}`);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ユーザー管理</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {loading && <div className="h-1 bg-blue-500 animate-pulse" />}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">名前</th>
                <th className="px-3 py-2 text-left">メールアドレス</th>
                <th className="px-3 py-2 text-left">ロール</th>
                <th className="px-3 py-2 text-left">登録日</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-400 py-8"
                  >
                    ユーザーがいません
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-3 py-2">{user.id}</td>
                    <td className="px-3 py-2">
                      {user.name}
                      {user.id === currentUserId && (
                        <span className="text-xs text-gray-400 ml-1">
                          (自分)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          disabled={user.id === currentUserId}
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">ユーザーを編集</h2>
              {editError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-3">
                <div>
                  <Label>名前</Label>
                  <Input
                    className="mt-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>メールアドレス</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>ロール</Label>
                  <select
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    value={editRole}
                    onChange={(e) =>
                      setEditRole(e.target.value as "admin" | "user")
                    }
                  >
                    <option value="user">ユーザー</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={closeEdit}>
                  キャンセル
                </Button>
                <Button disabled={saving} onClick={handleUpdate}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
