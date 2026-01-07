import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistem Rekomendasi Gitar",
  description: "Aplikasi rekomendasi gitar menggunakan metode Collaborative Filtering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
