export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale layout at app/[locale]/layout.tsx renders <html lang={locale}>
  return children;
}
