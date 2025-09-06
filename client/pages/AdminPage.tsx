import React from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
  const { profile } = useAuth();

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/95 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-white/70 mt-2">You must be an admin to access this area.</p>
        </div>
      </div>
    );
  }

  // Render the admin panel as a full-screen page
  return <AdminPanel isOpen={true} onClose={() => { /* no-op on page */ }} />;
}
