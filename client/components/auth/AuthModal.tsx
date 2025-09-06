import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        company: signUpData.company,
      });
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to APEX! You can now start shopping.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            <img
              src="/Beige and Grey Minimalist Modern Bold Typographic Brand Logo (5).jpg"
              alt="APEX Logo"
              className="h-12 w-auto mx-auto mb-4"
            />
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-brand-red data-[state=active]:text-white"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-brand-red data-[state=active]:text-white"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center text-sm font-medium">
                  <Mail className="h-3 w-3 mr-1" />
                  Email Address
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  required
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center text-sm font-medium">
                  <Lock className="h-3 w-3 mr-1" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60 pr-12"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold py-3 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="signup-firstName"
                    required
                    value={signUpData.firstName}
                    onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="signup-lastName"
                    required
                    value={signUpData.lastName}
                    onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center text-sm font-medium">
                  <Mail className="h-3 w-3 mr-1" />
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  required
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="flex items-center text-sm font-medium">
                    <Phone className="h-3 w-3 mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="signup-phone"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                    placeholder="+27 12 345 6789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-company" className="flex items-center text-sm font-medium">
                    <Building className="h-3 w-3 mr-1" />
                    Company
                  </Label>
                  <Input
                    id="signup-company"
                    value={signUpData.company}
                    onChange={(e) => setSignUpData({ ...signUpData, company: e.target.value })}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center text-sm font-medium">
                  <Lock className="h-3 w-3 mr-1" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60 pr-12"
                    placeholder="Create a password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="signup-confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder-white/60"
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold py-3 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-white/60 mt-4">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-brand-red hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-brand-red hover:underline">
            Privacy Policy
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}