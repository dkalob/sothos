import Sidebar from "@/components/nav/sidebar"
import Navbar from "@/components/nav/navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Navbar/>
        <main className='p-6'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}