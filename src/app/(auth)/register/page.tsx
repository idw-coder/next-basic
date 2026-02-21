"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (data: any) => {
    try {
      setErrorMsg("");
      await api.post("/api/users", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const loginRes = await api.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));
      window.location.href = "/"; // HeaderNavの状態を確実に更新するためフルリロード
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "登録に失敗しました");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 mt-8">
      <Card className="w-full max-w-sm">
        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="山田 太郎"
                {...register("name", { required: "必須項目です" })}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{String(errors.name.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register("email", { required: "必須項目です" })}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{String(errors.email.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { 
                  required: "必須項目です",
                  minLength: { value: 6, message: "6文字以上で入力してください" }
                })}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{String(errors.password.message)}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録してはじめる"}
            </Button>
          </form>
          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}