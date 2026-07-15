import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-gray-800 mb-8">פאנל ניהול - שימי</h1>
        <AdminDashboard />
      </div>
    </main>
  );
}
