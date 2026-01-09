"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Masuk ke Akun Anda</h2>
          <p className="mt-2 text-sm text-gray-600">Selamat datang kembali di GuitarRecs</p>
        </div>

        <Card>
          <Card.Body>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

              <Input
                id="email"
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />

              <Input
                id="password"
                label="Kata Sandi"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <div>
                <Button type="submit" className="w-full" loading={loading}>
                  Masuk
                </Button>
              </div>
            </form>
          </Card.Body>
          <Card.Footer className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Daftar disini
            </Link>
          </Card.Footer>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Test Credential:</p>
          <p>Admin: admin@example.com / password123</p>
          <p>User: user5@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
