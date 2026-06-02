"use client";

import Link from "next/link";
import { HelpCircle, NotebookPen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ダッシュボード</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/notes/new">
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <NotebookPen className="h-5 w-5" />
              <span>ノートを作成</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/quizzes">
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <HelpCircle className="h-5 w-5" />
              <span>クイズ管理</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
