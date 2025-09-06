import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { ContentManager } from "./ContentManager";
import { ProductManager } from "./ProductManager";
import { MediaManager } from "./MediaManager";
import { AdminStats } from "./AdminStats";
import {
  Settings,
  FileText,
  Package,
  Image,
  BarChart3,
  Shield,
  X,
  Crown,
} from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

  if (!isOpen || !isAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="fixed inset-4 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-brand-red/20 to-red-600/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-brand-red to-red-600">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/60">Manage your APEX website</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-88px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/20 bg-black/50 p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
            >
              <TabsList className="grid w-full grid-rows-5 h-auto bg-white/10 p-1">
                <TabsTrigger
                  value="dashboard"
                  className="w-full justify-start data-[state=active]:bg-brand-red data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="w-full justify-start data-[state=active]:bg-brand-red data-[state=active]:text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="w-full justify-start data-[state=active]:bg-brand-red data-[state=active]:text-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="w-full justify-start data-[state=active]:bg-brand-red data-[state=active]:text-white"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="w-full justify-start data-[state=active]:bg-brand-red data-[state=active]:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="dashboard" className="p-6 space-y-6">
                <AdminStats onNavigate={setActiveTab} />
              </TabsContent>

              <TabsContent value="content" className="p-6">
                <ContentManager />
              </TabsContent>

              <TabsContent value="products" className="p-6">
                <ProductManager />
              </TabsContent>

              <TabsContent value="media" className="p-6">
                <MediaManager />
              </TabsContent>

              <TabsContent value="settings" className="p-6">
                <Card className="bg-white/5 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-brand-red" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white">
                    <p>
                      System settings and configuration options will be
                      available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
