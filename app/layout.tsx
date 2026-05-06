import type { Metadata } from "next";

import "@/app/globals.css";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "Helm",
  description: "Single-user developer command center.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
