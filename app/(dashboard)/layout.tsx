import Sidebar from "@/components/nav/sidebar"
import Navbar from "@/components/nav/navbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      
      <Sidebar />
      <Navbar />

      <main className="ml-64 mt-16 flex-1 p-6">
        {children}
      </main>

    </div>
  )
}