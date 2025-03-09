export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'İddiakolik - Test',
  description: 'İddiakolik test sayfası',
};
