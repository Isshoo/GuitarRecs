"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
          <p className="mt-2 text-sm text-gray-600">Dapatkan rekomendasi gitar terbaik untuk Anda</p>
        </div>

        <Card>
          <Card.Body>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

              <Input
                id="name"
                label="Nama Lengkap"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
              />

              <Input
                id="email"
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
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
                  Daftar
                </Button>
              </div>
            </form>
          </Card.Body>
          <Card.Footer className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Masuk disini
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}
