import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-white p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500"> 
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}