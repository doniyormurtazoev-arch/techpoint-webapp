import "./globals.css";

export const metadata = {
  title: "TechPoint",
  description: "TechPoint Web App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
