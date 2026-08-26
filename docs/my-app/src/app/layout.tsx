import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuillHawk — Where Words Take Flight",
  description: "The next-generation literary platform. Read, track, publish, and discuss together in deep ink and silver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('quillhawk-theme') || localStorage.getItem('theme');
                  var root = document.documentElement;
                  if (saved === 'dark') {
                    root.setAttribute('data-theme', 'dark');
                    root.classList.add('dark');
                  } else if (saved === 'silver') {
                    root.setAttribute('data-theme', 'silver');
                    root.classList.remove('dark');
                  } else if (saved === 'system') {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      root.setAttribute('data-theme', 'dark');
                      root.classList.add('dark');
                    } else {
                      root.setAttribute('data-theme', 'silver');
                      root.classList.remove('dark');
                    }
                  } else {
                    root.setAttribute('data-theme', 'silver');
                    root.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${outfit.variable} min-h-screen bg-background text-foreground font-sans transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
