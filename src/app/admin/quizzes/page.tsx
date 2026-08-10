"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { fetchNextApiJson } from "@/lib/nextApiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, Plus, Pencil, Trash2, Search } from "lucide-react";

interface QuizCategory {
  id: number;
  slug: string;
  category_name: string;
}

interface QuizTag {
  id: number;
  slug: string;
  name: string;
}

interface Quiz {
  id: number;
  slug: string;
  question: string;
  category_id: number;
  category_name?: string;
  tags?: QuizTag[];
}

export default function QuizListPage() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allTags, setAllTags] = useState<QuizTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [exporting, setExporting] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created_count: number;
    updated_count: number;
    error_count: number;
    created_tags: string[];
    errors: string[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const rawFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCsvUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/quiz/csv/sample`
      : "http://localhost:8888/api/quiz/csv/sample";

  const fetchAllQuizzes = useCallback(async (cats?: QuizCategory[]) => {
    setLoading(true);
    try {
      const useCats = cats ?? categories;
      const categoryMap = new Map(
        useCats.map((c) => [c.id, c.category_name])
      );
      const results = await Promise.all(
        useCats.map(async (cat) => {
          const quizzes = await fetchNextApiJson<Quiz[]>(
            `/next-api/quiz/category/${cat.id}/quizzes`,
          );
          return quizzes.map((q) => ({
            ...q,
            category_id: cat.id,
            category_name: categoryMap.get(cat.id) ?? "",
          }));
        })
      );
      setQuizzes(results.flat());
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const fetchAllTags = useCallback(async () => {
    const tags = await fetchNextApiJson<QuizTag[]>("/next-api/quiz/tags");
    setAllTags(
      tags.sort((a, b) => a.slug.localeCompare(b.slug, "ja"))
    );
  }, []);

  useEffect(() => {
    (async () => {
      const [cats, tags] = await Promise.all([
        fetchNextApiJson<QuizCategory[]>("/next-api/quiz/categories"),
        fetchNextApiJson<QuizTag[]>("/next-api/quiz/tags"),
      ]);
      setCategories(cats);
      setAllTags(
        tags.sort((a, b) =>
          a.slug.localeCompare(b.slug, "ja")
        )
      );
      await fetchAllQuizzes(cats);
    })();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const onCategoryChange = (val: string) => {
    const id = val ? Number(val) : null;
    setSelectedCategoryId(id);
  };

  const onTagChange = (val: string) => {
    const slug = val || null;
    setSelectedTagSlug(slug);
  };

  const filteredQuizzes = useMemo(() => {
    let q = quizzes;
    if (selectedCategoryId) {
      q = q.filter(
        (quiz) => String(quiz.category_id) === String(selectedCategoryId)
      );
    }
    if (selectedTagSlug) {
      q = q.filter((quiz) =>
        quiz.tags?.some((tag) => tag.slug === selectedTagSlug)
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      q = q.filter((quiz) =>
        [quiz.question, quiz.slug, quiz.category_name ?? ""].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }
    return q;
  }, [quizzes, searchQuery, selectedCategoryId, selectedTagSlug]);

  const groupedQuizzes = useMemo(() => {
    const groups: Record<string, Quiz[]> = {};
    for (const q of filteredQuizzes) {
      const key = q.category_name || "未分類";
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredQuizzes]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = selectedCategoryId
        ? { category_id: selectedCategoryId }
        : {};
      const res = await api.get("/api/quiz/csv/export", {
        params,
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quizzes_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!rawFileRef.current) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const csvText = await rawFileRef.current.text();
      const res = await api.post("/api/quiz/csv/import", { csv: csvText });
      setImportResult(res.data);
      await Promise.all([fetchAllQuizzes(), fetchAllTags()]);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      setImportError(msg ?? "インポートに失敗しました");
    } finally {
      setImporting(false);
    }
  };

  const closeImportDialog = () => {
    setImportDialog(false);
    rawFileRef.current = null;
    setFileName("");
    setImportResult(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    await fetchNextApiJson<{ message: string }>(`/next-api/quiz/${id}`, {
      auth: true,
      method: "DELETE",
    });
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base font-bold">クイズ管理</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV出力
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialog(true)}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            CSV取込
          </Button>
          <Link href="/admin/quizzes/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              クイズ作成
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={selectedCategoryId ?? ""}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category_name}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-1.5 text-sm disabled:opacity-50"
          value={selectedTagSlug ?? ""}
          onChange={(e) => onTagChange(e.target.value)}
        >
          <option value="">すべてのタグ</option>
          {allTags.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="キーワード検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Import Dialog */}
      {importDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">CSVインポート</h2>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm flex items-center justify-between">
                <span>
                  フォーマットが分からない場合はサンプルをダウンロードしてください
                </span>
                <a
                  href={sampleCsvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  サンプルCSV
                </a>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  rawFileRef.current = file;
                  setFileName(file?.name ?? "");
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                {fileName || "CSVファイルを選択"}
              </Button>
              {importResult && (
                <Alert
                  className="mt-3"
                  variant={
                    importResult.error_count > 0 ? "destructive" : "default"
                  }
                >
                  <AlertDescription>
                    <div>
                      作成: {importResult.created_count}件 / 更新:{" "}
                      {importResult.updated_count}件 / エラー:{" "}
                      {importResult.error_count}件
                    </div>
                    {importResult.created_tags.length > 0 && (
                      <div className="mt-1 text-xs">
                        新規タグ作成: {importResult.created_tags.join(", ")}
                      </div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="mt-1 text-xs">
                        {importResult.errors.map((err, i) => (
                          <div key={i}>{err}</div>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {importError && (
                <Alert variant="destructive" className="mt-3">
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={closeImportDialog}>
                  閉じる
                </Button>
                <Button
                  disabled={!fileName || importing}
                  onClick={handleImport}
                >
                  {importing ? "インポート中..." : "インポート"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Table */}
      <Card>
        <div className="overflow-auto max-h-[calc(100vh-200px)]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white border-b">
              <tr>
                <th className="px-3 py-2 text-left w-12">ID</th>
                <th className="px-3 py-2 text-left w-32">Slug</th>
                <th className="px-3 py-2 text-left">問題文</th>
                <th className="px-3 py-2 text-left w-40">タグ</th>
                <th className="px-3 py-2 text-center w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    読み込み中...
                  </td>
                </tr>
              ) : groupedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    クイズがありません
                  </td>
                </tr>
              ) : (
                groupedQuizzes.map(([categoryName, items]) => (
                  <QuizGroup
                    key={categoryName}
                    categoryName={categoryName}
                    quizzes={items}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function QuizGroup({
  categoryName,
  quizzes,
  onDelete,
}: {
  categoryName: string;
  quizzes: Quiz[];
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <tr className="bg-gray-50">
        <td colSpan={5} className="px-3 py-1.5 font-medium text-sm">
          {categoryName}
        </td>
      </tr>
      {quizzes.map((q) => (
        <tr key={q.id} className="border-b hover:bg-gray-50">
          <td className="px-3 py-1">{q.id}</td>
          <td className="px-3 py-1 text-gray-500">{q.slug}</td>
          <td className="px-3 py-1">{q.question}</td>
          <td className="px-3 py-1">
            <div className="flex flex-wrap gap-1">
              {q.tags?.map((t) => (
                <Badge key={t.id} variant="secondary" className="text-[10px]">
                  {t.name}
                </Badge>
              ))}
            </div>
          </td>
          <td className="px-3 py-1 text-center">
            <div className="flex justify-center gap-1">
              <Link href={`/admin/quizzes/${q.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Pencil className="h-3 w-3" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500"
                onClick={() => onDelete(q.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
