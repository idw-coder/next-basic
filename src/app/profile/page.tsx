"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface EditForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  admin: { label: "管理者", variant: "destructive" },
  user: { label: "一般ユーザー", variant: "secondary" },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("user");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({ name: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
        setRole(res.data.role ?? "user");
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (error) {
        console.error("Failed to fetch user:", error);
        handleLogout();
      }
    };

    if (!localStorage.getItem("token")) {
      router.replace("/login");
    } else {
      fetchUser();
    }
  }, [router]);

  const avatarSvg = useMemo(() => {
    if (!user) return null;
    const svg = createAvatar(identicon, { seed: user.email, size: 96 }).toString();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [user]);

  const handleEditStart = () => {
    if (!user) return;
    setForm({ name: user.name, email: user.email, currentPassword: "", newPassword: "", confirmPassword: "" });
    setError(null);
    setSuccess(null);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError("名前とメールアドレスは必須です");
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("新しいパスワードが一致しません");
      return;
    }

    if (form.newPassword && !form.currentPassword) {
      setError("パスワードを変更する場合は現在のパスワードが必要です");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await api.patch("/api/auth/me", payload);
      const updated: User = res.data.user;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("プロフィールを更新しました");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "更新に失敗しました";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !avatarSvg) return null;

  const roleInfo = ROLE_LABELS[role] ?? { label: role, variant: "secondary" as const };

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 mt-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center pb-2">
          <Image
            src={avatarSvg}
            alt={`${user.name}のアイコン`}
            width={96}
            height={96}
            className="rounded-full border bg-muted"
            unoptimized
          />
          <CardTitle className="mt-3 text-center">{user.name}</CardTitle>
          <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {success && (
            <p className="text-sm text-green-600 bg-green-50 rounded-md px-3 py-2">{success}</p>
          )}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">お名前</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="border-t pt-3 space-y-1">
                <p className="text-xs text-muted-foreground mb-2">パスワード変更（任意）</p>
                <div className="space-y-1">
                  <Label htmlFor="currentPassword">現在のパスワード</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="変更する場合のみ入力"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                    placeholder="6文字以上"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "保存中…" : "保存"}
                </Button>
                <Button onClick={handleEditCancel} variant="outline" className="flex-1">
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">メールアドレス</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">登録日</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <Button onClick={handleEditStart} variant="secondary" className="w-full">
                プロフィールを編集
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                ログアウト
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
