import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Navbar } from './components/layout/Navbar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { MaintenanceDashboard } from './components/maintenance/MaintenanceDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ComplaintDetailModal } from './components/complaints/ComplaintDetailModal';
import { NewComplaintModal } from './components/complaints/NewComplaintModal';
import { Building2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-campus-600 flex items-center justify-center animate-bounce mb-3 shadow-lg shadow-campus-600/30">
          <Building2 className="w-7 h-7" />
        </div>
        <p className="text-xs text-slate-400 font-medium">Initializing Fix My Campus...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenComplaintModal={(id) => setSelectedComplaintId(id)}
        onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user.role === 'ADMIN' && (
          <AdminDashboard
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {user.role === 'MAINTENANCE' && (
          <MaintenanceDashboard
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
          <StudentDashboard
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      {/* Modals */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={Boolean(selectedComplaintId)}
        onClose={() => setSelectedComplaintId(null)}
        onComplaintUpdated={handleRefresh}
      />

      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSuccess={() => handleRefresh()}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
