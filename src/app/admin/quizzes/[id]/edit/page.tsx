'use client';

import TiptapEditor from '@/components/admin/TiptapEditor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchNextApiJson } from '@/lib/nextApiClient';
import { ArrowLeft, Copy, ExternalLink, FileOutput, Import, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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

interface Choice {
  choice_text: string;
  is_correct: boolean;
}

interface QuizForm {
  slug: string;
  question: string;
  explanation?: string;
  category_id: number;
  choices?: Choice[];
  tags?: QuizTag[];
}

function createDefaultChoices(count = 4): Choice[] {
  return Array.from({ length: count }, () => ({
    choice_text: '',
    is_correct: false,
  }));
}

function extractJsonFromText(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj?.[0]) return obj[0];
  return text.trim();
}

function repairJson(input: string): string {
  const VALID_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);
  const out: string[] = [];
  let inStr = false;
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (inStr) {
      if (ch === '\\') {
        const next = input[i + 1];
        if (next === undefined) {
          out.push('\\\\');
          i++;
          continue;
        }
        if (VALID_ESCAPES.has(next)) {
          out.push(ch, next);
        } else {
          out.push('\\\\', next);
        }
        i += 2;
        continue;
      }
      if (ch === '\n') {
        out.push('\\n');
        i++;
        continue;
      }
      if (ch === '"') {
        const after = input.slice(i + 1).trimStart();
        const next = after[0] as string | undefined;
        const isEnd =
          next === undefined || next === ',' || next === ':' || next === '}' || next === ']';
        if (isEnd) {
          inStr = false;
          out.push(ch);
        } else {
          out.push('\\"');
        }
        i++;
        continue;
      }
      out.push(ch);
    } else {
      if (ch === '"') inStr = true;
      out.push(ch);
    }
    i++;
  }
  return out.join('');
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(repairJson(text));
  }
}

function escapeHtmlInCodeBlocks(html: string): string {
  return html.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, content: string) => {
    const decoded = content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
    const escaped = decoded.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  });
}

function buildPrompt(topic: string): string {
  return `「${topic}」に関する4択クイズを1問作成してください。

以下のJSON形式のみを出力してください:
{
  "slug": "英語ケバブケース（例: javascript-closures）",
  "question": "問題文",
  "choices": [
    { "choice_text": "選択肢1", "is_correct": false },
    { "choice_text": "選択肢2", "is_correct": true },
    { "choice_text": "選択肢3", "is_correct": false },
    { "choice_text": "選択肢4", "is_correct": false }
  ],
  "explanation": "<p>解説文。<code>コード</code>や<strong>強調</strong>、<pre><code>コードブロック</code></pre>、<ul><li>リスト</li></ul>等を活用</p>",
  "tags": ["関連タグをケバブケースで"]
}

条件:
- is_correct が true の選択肢は必ず1つだけ
- question と choice_text はプレーンテキストのみ
- slug・tags は英語のケバブケースで出力
- 解説は600〜1000文字程度のHTMLリッチテキスト（<p>, <strong>, <code>, <pre><code>, <ul><li> 等を積極的に使い、読みやすく構造化する）`;
}

export default function QuizEditPage() {
  const params = useParams();
  const router = useRouter();
  const paramId = params?.id as string | undefined;
  const isNew = !paramId || paramId === 'new';
  const quizId = useRef<number | null>(isNew ? null : Number(paramId));

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [allTags, setAllTags] = useState<QuizTag[]>([]);

  const [slug, setSlug] = useState('');
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagSlug, setNewTagSlug] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [choices, setChoices] = useState<Choice[]>(createDefaultChoices());
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [aiTopic, setAiTopic] = useState('');
  const [importDialog, setImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    (async () => {
      const [categories, tags] = await Promise.all([
        fetchNextApiJson<QuizCategory[]>('/next-api/quiz/categories'),
        fetchNextApiJson<QuizTag[]>('/next-api/quiz/tags'),
      ]);
      setCategories(categories);
      setAllTags(tags.sort((a, b) => a.slug.localeCompare(b.slug, 'ja')));

      if (!isNew && quizId.current) {
        const quiz = await fetchNextApiJson<QuizForm>(`/next-api/quiz/${quizId.current}`);
        setSlug(quiz.slug);
        setQuestion(quiz.question);
        setExplanation(quiz.explanation ?? '');
        setCategoryId(quiz.category_id);
        setSelectedTags(quiz.tags?.map((t: QuizTag) => t.slug) ?? []);
        if (quiz.choices?.length) {
          setChoices(
            quiz.choices.map((c: Choice) => ({
              choice_text: c.choice_text,
              is_correct: Boolean(c.is_correct),
            })),
          );
          setCorrectIndex(quiz.choices.findIndex((c: Choice) => Boolean(c.is_correct)));
        }
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTag = (tagSlug: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug) ? prev.filter((s) => s !== tagSlug) : [...prev, tagSlug],
    );
  };

  const handleCreateTag = async () => {
    const tagSlug = newTagSlug.trim();
    const tagName = newTagName.trim();
    if (!tagSlug || !tagName) return;

    setError(null);
    setCreatingTag(true);
    try {
      const created = await fetchNextApiJson<QuizTag>('/next-api/quiz/tags', {
        auth: true,
        method: 'POST',
        body: {
          slug: tagSlug,
          name: tagName,
        },
      });
      setAllTags((prev) => [...prev, created].sort((a, b) => a.slug.localeCompare(b.slug, 'ja')));
      setSelectedTags((prev) => (prev.includes(created.slug) ? prev : [...prev, created.slug]));
      setNewTagSlug('');
      setNewTagName('');
      showToast('タグを追加しました');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'タグの追加に失敗しました');
    } finally {
      setCreatingTag(false);
    }
  };

  const addChoice = () => setChoices((prev) => [...prev, { choice_text: '', is_correct: false }]);

  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;
    setChoices((prev) => prev.filter((_, i) => i !== index));
    if (correctIndex === index) setCorrectIndex(null);
    else if (correctIndex !== null && correctIndex > index) setCorrectIndex(correctIndex - 1);
  };

  const updateChoiceText = (index: number, text: string) => {
    setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, choice_text: text } : c)));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!slug.trim() || !question.trim() || categoryId === null || correctIndex === null) {
      setError('必須項目を入力してください');
      return;
    }
    const choicesPayload = choices.map((c, i) => ({
      choice_text: c.choice_text,
      is_correct: i === correctIndex,
    }));

    setSaving(true);
    try {
      const payload = {
        slug: slug.trim(),
        question: question.trim(),
        explanation,
        category_id: categoryId,
        choices: choicesPayload,
        tags: selectedTags,
      };
      if (isNew) {
        const quiz = await fetchNextApiJson<QuizForm & { id: number }>('/next-api/quiz', {
          auth: true,
          method: 'POST',
          body: payload,
        });
        quizId.current = quiz.id;
        router.replace(`/admin/quizzes/${quiz.id}/edit`);
      } else {
        await fetchNextApiJson<QuizForm>(`/next-api/quiz/${quizId.current}`, {
          auth: true,
          method: 'PUT',
          body: payload,
        });
      }
      showToast('保存しました');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const copyPrompt = async () => {
    if (!aiTopic.trim()) return;
    await navigator.clipboard.writeText(buildPrompt(aiTopic.trim()));
    showToast('プロンプトをコピーしました');
  };

  const applyImport = () => {
    setImportError(null);
    try {
      const raw = extractJsonFromText(importJson);
      const data = safeParseJson(raw) as {
        slug?: string;
        question?: string;
        choices?: Choice[];
        explanation?: string;
        tags?: string[];
      };
      if (data.slug) setSlug(data.slug);
      if (data.question) setQuestion(data.question);
      if (data.explanation) setExplanation(escapeHtmlInCodeBlocks(data.explanation));
      if (data.choices?.length) {
        setChoices(
          data.choices.map((c) => ({
            choice_text: c.choice_text,
            is_correct: Boolean(c.is_correct),
          })),
        );
        setCorrectIndex(data.choices.findIndex((c) => Boolean(c.is_correct)));
      }
      if (data.tags?.length) {
        const existing = new Set(allTags.map((t) => t.slug));
        setSelectedTags(data.tags.filter((t) => existing.has(t)));
      }
      setImportDialog(false);
      setImportJson('');
      showToast('インポートしました');
    } catch (e) {
      setImportError(`JSONの解析に失敗しました。${e instanceof Error ? e.message : ''}`);
    }
  };

  const exportJson = async () => {
    const data = {
      slug,
      question,
      choices: choices.map((c, i) => ({
        choice_text: c.choice_text,
        is_correct: i === correctIndex,
      })),
      explanation,
      tags: selectedTags,
    };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    showToast('JSONをコピーしました');
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const quizPageHref =
    !isNew && quizId.current && selectedCategory
      ? `/quiz/${selectedCategory.slug}/${quizId.current}`
      : null;

  return (
    <div>
      <Link href="/admin/quizzes">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          一覧へ戻る
        </Button>
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold">{isNew ? '新規クイズ作成' : 'クイズを編集'}</h1>
            <div className="flex gap-2">
              {quizPageHref && (
                <Button asChild variant="outline" size="sm">
                  <Link href={quizPageHref} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    クイズページを開く
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setImportDialog(true)}>
                <Import className="h-3.5 w-3.5 mr-1" />
                インポート
              </Button>
              <Button variant="outline" size="sm" onClick={exportJson}>
                <FileOutput className="h-3.5 w-3.5 mr-1" />
                エクスポート
              </Button>
            </div>
          </div>

          {/* AI Helper */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm font-medium mb-2">AI生成支援</div>
            <div className="flex gap-2">
              <Input
                placeholder="トピック（例: JavaScriptのクロージャ）"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && copyPrompt()}
              />
              <Button variant="outline" disabled={!aiTopic.trim()} onClick={copyPrompt}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                プロンプトをコピー
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              トピックを入力 → プロンプトをコピー → AIに貼り付け → 結果を「インポート」で取り込み
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label>スラッグ</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>問題文</Label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div>
              <Label>解説</Label>
              <div className="mt-1">
                <TiptapEditor
                  value={explanation}
                  onChange={setExplanation}
                  placeholder="解説を入力してください"
                />
              </div>
            </div>

            <div>
              <Label>カテゴリ</Label>
              <select
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">選択してください</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>タグ</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {allTags.length === 0 ? (
                  <span className="text-gray-400 text-sm">タグが登録されていません</span>
                ) : (
                  allTags.map((tag) => (
                    <Badge
                      key={tag.slug}
                      variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.slug)}
                    >
                      {tag.name}
                    </Badge>
                  ))
                )}
              </div>
              <div className="mt-3 rounded-md border bg-gray-50 p-3">
                <div className="text-sm font-medium mb-2">新規タグを追加</div>
                <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
                  <Input
                    placeholder="slug"
                    value={newTagSlug}
                    onChange={(e) => setNewTagSlug(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  />
                  <Input
                    placeholder="表示名"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!newTagSlug.trim() || !newTagName.trim() || creatingTag}
                    onClick={handleCreateTag}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {creatingTag ? '追加中...' : '追加して選択'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  追加したタグはこのクイズの選択済みタグに自動で入ります。
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>選択肢</Label>
                <Button variant="ghost" size="sm" onClick={addChoice}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  追加
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctIndex === index}
                      onChange={() => setCorrectIndex(index)}
                      className="h-4 w-4"
                    />
                    <Input
                      className="flex-1"
                      placeholder={`選択肢 ${index + 1}`}
                      value={choice.choice_text}
                      onChange={(e) => updateChoiceText(index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      disabled={choices.length <= 2}
                      onClick={() => removeChoice(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">ラジオボタンで正解を1つ選んでください</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button disabled={saving} onClick={handleSubmit}>
              {saving ? '保存中...' : '保存'}
            </Button>
            <Link href="/admin/quizzes">
              <Button variant="outline">キャンセル</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      {importDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-2">JSONインポート</h2>
              <p className="text-sm text-gray-500 mb-3">
                AIが生成したJSONをそのまま貼り付けてください。コードブロック付きでもOKです。
              </p>
              {importError && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm font-mono min-h-[250px]"
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{ "slug": "...", "question": "...", ... }'
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportDialog(false);
                    setImportJson('');
                    setImportError(null);
                  }}
                >
                  キャンセル
                </Button>
                <Button disabled={!importJson.trim()} onClick={applyImport}>
                  取り込み
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
