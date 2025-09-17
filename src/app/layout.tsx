import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeMatch - Подбор идеальных рецептов",
  description: "Персональный сервис подбора рецептов на основе ваших предпочтений и доступных продуктов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <FavoritesProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
