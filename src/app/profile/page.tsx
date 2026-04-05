"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Flame, Target, BookOpen, TrendingUp } from "lucide-react";

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

interface QuizAnswerRecord {
  quizId: number;
  categoryId: number;
  isCorrect: boolean;
  answeredAt: string;
}

interface CategorySummary {
  categoryId: number;
  slug: string;
  name: string;
  total: number;
  correct: number;
}

interface QuizStats {
  totalAnswered: number;
  totalCorrect: number;
  correctRate: number;
  streakDays: number;
  categorySummary: CategorySummary[];
}

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  admin: { label: "管理者", variant: "destructive" },
  user: { label: "一般ユーザー", variant: "secondary" },
};

// スラグから色へのマッピング（新カテゴリ追加時はここに追記するだけでよい）
const SLUG_COLOR: Record<string, string> = {
  "html-basic": "bg-orange-500",
  "css-basic": "bg-blue-500",
  "javascript-basic": "bg-amber-500",
  "react-basic": "bg-cyan-500",
  "vue-basic": "bg-emerald-500",
  "nodejs-basic": "bg-green-500",
  "aws-basic": "bg-amber-600",
  "git-basic": "bg-rose-600",
  "nginx-basic": "bg-teal-500",
  "ts-general": "bg-indigo-500",
  "security-general": "bg-red-500",
  "cs-basic": "bg-purple-500",
  "nextjs": "bg-slate-700",
  "docker": "bg-sky-500",
  "linux": "bg-lime-500",
};

interface ApiCategory {
  id: number;
  slug: string;
  categoryName?: string;
  category_name?: string;
}

function calcStreak(answers: QuizAnswerRecord[]): number {
  if (answers.length === 0) return 0;
  const dateSet = new Set(
    answers.map((a) => new Date(a.answeredAt).toISOString().slice(0, 10))
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const d = new Date(today);
  while (dateSet.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function buildStats(
  answers: QuizAnswerRecord[],
  categoryById: Record<number, { slug: string; name: string }>,
): QuizStats {
  const totalAnswered = answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;

  const summaryMap = new Map<number, { total: number; correct: number }>();
  for (const a of answers) {
    const entry = summaryMap.get(a.categoryId) ?? { total: 0, correct: 0 };
    entry.total++;
    if (a.isCorrect) entry.correct++;
    summaryMap.set(a.categoryId, entry);
  }

  const categorySummary: CategorySummary[] = Array.from(summaryMap.entries()).map(
    ([categoryId, s]) => {
      const meta = categoryById[categoryId];
      return {
        categoryId,
        slug: meta?.slug ?? "",
        name: meta?.name ?? `カテゴリ ${categoryId}`,
        total: s.total,
        correct: s.correct,
      };
    }
  );

  return {
    totalAnswered,
    totalCorrect,
    correctRate: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 1000) / 10 : 0,
    streakDays: calcStreak(answers),
    categorySummary,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("user");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({ name: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswerRecord[] | null>(null);
  const [categoryById, setCategoryById] = useState<Record<number, { slug: string; name: string }>>({});

  const quizStats = useMemo(
    () => (answers ? buildStats(answers, categoryById) : null),
    [answers, categoryById],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }, [router]);

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

    const fetchAnswers = async () => {
      try {
        const res = await api.get("/api/quiz/history");
        setAnswers(res.data);
      } catch (error) {
        console.error("Failed to fetch quiz history:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/quiz/categories");
        const cats: ApiCategory[] = res.data;
        const map: Record<number, { slug: string; name: string }> = {};
        for (const c of cats) {
          map[c.id] = {
            slug: c.slug,
            name: c.categoryName ?? c.category_name ?? c.slug,
          };
        }
        setCategoryById(map);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    if (!localStorage.getItem("token")) {
      router.replace("/login");
    } else {
      fetchUser();
      fetchAnswers();
      fetchCategories();
    }
  }, [router, handleLogout]);

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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* プロフィールカード */}
      <Card>
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

      {/* クイズ履歴セクション */}
      {quizStats && (
        <>
          {/* 概要カード群 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center pt-5 pb-4">
                <BookOpen className="size-5 text-primary mb-1" />
                <p className="text-2xl font-bold">{quizStats.totalAnswered}</p>
                <p className="text-xs text-muted-foreground">回答数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-5 pb-4">
                <Target className="size-5 text-green-500 mb-1" />
                <p className="text-2xl font-bold">{quizStats.correctRate}%</p>
                <p className="text-xs text-muted-foreground">正答率</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-5 pb-4">
                <TrendingUp className="size-5 text-blue-500 mb-1" />
                <p className="text-2xl font-bold">{quizStats.totalCorrect}</p>
                <p className="text-xs text-muted-foreground">正解数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-5 pb-4">
                <Flame className="size-5 text-orange-500 mb-1" />
                <p className="text-2xl font-bold">{quizStats.streakDays}</p>
                <p className="text-xs text-muted-foreground">連続学習日</p>
              </CardContent>
            </Card>
          </div>

          {/* カテゴリ別進捗 */}
          {quizStats.categorySummary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">カテゴリ別の学習進捗</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizStats.categorySummary.map((cat) => {
                  const rate = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
                  const barColor = SLUG_COLOR[cat.slug] ?? "bg-primary";
                  return (
                    <div key={cat.categoryId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">
                          {cat.correct}/{cat.total} 正解（{rate}%）
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* 学習が未開始の場合 */}
          {quizStats.totalAnswered === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  まだクイズの回答履歴がありません
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  クイズに挑戦して学習を始めましょう！
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
