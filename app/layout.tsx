import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_KR, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Wabi",
  description: "워킹홀리데이를 준비하는 사람과 현지에 도착한 사람을 위한 앱",
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      suppressHydrationWarning
      className={`${notoSansKr.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {children}
        {/* discussion.md 29절: 방문 수만 집계한다. 앱이 라우트 하나(/)뿐이라 URL에
            이용자가 적은 글이 실릴 자리가 없고, localStorage 값을 넘기지 않는다
            (SecurityReview.md 2절 3번 규칙 확인 완료). */}
        <Analytics />
      </body>
    </html>
  );
}
