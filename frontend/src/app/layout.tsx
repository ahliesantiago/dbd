import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { UserProvider } from "@/contexts/user-context";

export const metadata: Metadata = {
  title: "DBD",
  description: "A visual planner (Day by Day), journal (Daily Brain Dump), and tracker (Daily Behavior Diary)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          storageKey="dbd-ui-theme"
        >
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
