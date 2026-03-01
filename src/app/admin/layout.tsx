import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/admin/NotificationBell";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
  title: "Admin Portal | FATHOM Elite",
  description: "Executive Management Dashboard.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex bg-[#F9F9F9] min-h-screen text-primary overflow-hidden w-full absolute inset-0 z-[100]">
        {/* Sidebar Navigation */}
        <AdminSidebar className="w-64 h-full shrink-0" />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* Top Header */}
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shrink-0 sticky top-0 z-50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.2em] transform uppercase text-gray-400">Dashboard</span>
              <span className="text-xl font-poppins font-bold">FATHOM Workstation</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold">Admin User</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">Super Admin</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-poppins font-bold text-sm">
                  AU
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 p-10">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

