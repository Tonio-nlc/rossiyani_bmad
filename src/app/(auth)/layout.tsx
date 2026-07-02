export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-brand-surface px-4 py-12">
      {children}
    </div>
  );
}
