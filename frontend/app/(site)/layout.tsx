export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="mx-auto min-h-[calc(100svh-3.5rem)] w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {children}
    </main>
  )
}
