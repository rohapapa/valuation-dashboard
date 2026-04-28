import "./globals.css";

export const metadata = {
  title: "지수 밸류에이션 대시보드",
  description: "S&P500, NASDAQ100, KOSPI200, CSI300 밸류에이션 모니터",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080c14",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, background: "#080c14" }}>
        {children}
      </body>
    </html>
  );
}
