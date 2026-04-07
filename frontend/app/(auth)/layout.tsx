export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] w-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 sm:py-16">
      {children}
    </main>
  )
}
