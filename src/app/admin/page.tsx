import NavigationHeader from "@/components/NavigationHeader";
import AdminGuard from "./_components/AdminGuard";
import AdminUsersContent from "./_components/AdminUsersContent";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <NavigationHeader />
      <AdminGuard>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage users, roles, and platform access</p>
          </div>
          <AdminUsersContent />
        </main>
      </AdminGuard>
    </div>
  );
}
