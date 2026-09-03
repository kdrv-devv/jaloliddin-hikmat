"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Input } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Kirishda xatolik yuz berdi.");
        setPending(false);
        return;
      }
      const next = params.get("keyin");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Server bilan bog'lanib bo'lmadi. Internetni tekshiring.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Foydalanuvchi nomi">
        {({ id }) => (
          <Input
            id={id}
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        )}
      </Field>

      <Field label="Parol">
        {({ id }) => (
          <Input
            id={id}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/35 bg-danger-soft px-3 py-2.5 text-[0.875rem] text-danger"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        loading={pending}
        className="w-full"
      >
        {pending ? "Tekshirilmoqda" : "Kirish"}
      </Button>
    </form>
  );
}
