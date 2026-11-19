import Sidebar from "@/components/nav/sidebar"
import Navbar from "@/components/nav/navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="min-w-0">
        <Navbar/>
        <main className='mt-3 min-w-0 p-3 sm:mt-5 sm:p-4 md:p-6'>
          {children}
        </main>
      </SidebarInset >
    </SidebarProvider>
  )
}