import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Settings,
  ShoppingBag,
  Heart,
  LogOut,
  Package,
  CreditCard,
  Shield,
} from "lucide-react";

export function UserMenu() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return profile.full_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return user?.email || "User";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-r from-brand-red to-red-600 text-white font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-black/95 backdrop-blur-xl border border-white/20 text-white" 
        align="end"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {getDisplayName()}
            </p>
            <p className="text-xs leading-none text-white/60">
              {user?.email}
            </p>
            {profile?.phone && (
              <p className="text-xs leading-none text-white/60">
                {profile.phone}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20" />
        
        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <Package className="mr-2 h-4 w-4" />
          <span>My Orders</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <Heart className="mr-2 h-4 w-4" />
          <span>Wishlist</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Payment Methods</span>
        </DropdownMenuItem>

        {/* Admin Panel Access - Only show for admin users */}
        {isAdmin() && (
          <>
            <DropdownMenuSeparator className="bg-white/20" />
            <Link to="/admin">
              <DropdownMenuItem className="hover:bg-orange-500/20 focus:bg-orange-500/20 text-orange-400 hover:text-orange-300">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-white/20" />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}