import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  Image,
  DollarSign,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  totalContent: number;
  totalMedia: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    totalContent: 0,
    totalMedia: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalOrders },
        { count: activeProducts },
        { count: totalContent },
        { count: totalMedia },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase.from("site_content").select("*", { count: "exact", head: true }),
        supabase.from("media_files").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        activeProducts: activeProducts || 0,
        totalContent: totalContent || 0,
        totalMedia: totalMedia || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Revenue",
      value: `R${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "Content Items",
      value: stats.totalContent,
      icon: FileText,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      title: "Media Files",
      value: stats.totalMedia,
      icon: Image,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="bg-white/5 border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-8 bg-white/10 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <Button
          onClick={fetchStats}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setActiveTab("products")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white font-bold py-4 rounded-xl"
            >
              <Package className="h-5 w-5 mr-2" />
              Add New Product
            </Button>
            <Button
              onClick={() => setActiveTab("content")}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-cyan-600 hover:to-blue-500 text-white font-bold py-4 rounded-xl"
            >
              <FileText className="h-5 w-5 mr-2" />
              Edit Content
            </Button>
            <Button
              onClick={() => setActiveTab("media")}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-500 text-white font-bold py-4 rounded-xl"
            >
              <Image className="h-5 w-5 mr-2" />
              Upload Media
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}