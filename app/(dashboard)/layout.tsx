import Sidebar from "@/components/nav/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="fixed top-0 left-0 h-screen w-64 border-r bg-background">
        <Sidebar />
      </aside>

      <main className="ml-64 flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
