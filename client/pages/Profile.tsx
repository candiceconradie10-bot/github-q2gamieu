import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Profile as ProfileType } from "@/lib/supabaseClient";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Save,
  Loader2,
  Edit3,
  Shield,
  CreditCard,
} from "lucide-react";

export default function Profile() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      province: "",
      postal_code: "",
      country: "South Africa"
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || {
          street: "",
          city: "",
          province: "",
          postal_code: "",
          country: "South Africa"
        }
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: Partial<ProfileType> = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date().toISOString()
      };

      const { error } = await updateProfile(updates);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Account Security</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-r from-brand-red to-red-600 text-white text-xl font-bold">
                        {user.email?.[0].toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        {formData.full_name || "User Profile"}
                        {profile?.is_admin && (
                          <Shield className="h-5 w-5 text-yellow-600" />
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "secondary" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isSaving}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center text-sm font-medium">
                        <User className="h-4 w-4 mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+27 12 345 6789"
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center text-sm font-medium">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        value={user.email || ""}
                        disabled
                        className="bg-muted"
                        title="Email cannot be changed here"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="flex items-center text-sm font-medium">
                        <MapPin className="h-4 w-4 mr-2" />
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={formData.address.country}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, country: e.target.value }
                        })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, street: e.target.value }
                          })}
                          disabled={!isEditing}
                          placeholder="123 Main Street"
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, city: e.target.value }
                          })}
                          disabled={!isEditing}
                          placeholder="Cape Town"
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
                        <Input
                          id="province"
                          value={formData.address.province}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, province: e.target.value }
                          })}
                          disabled={!isEditing}
                          placeholder="Western Cape"
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={formData.address.postal_code}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, postal_code: e.target.value }
                          })}
                          disabled={!isEditing}
                          placeholder="8000"
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
                      >
                        {isSaving ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <p className="text-muted-foreground">
                  Manage your account security settings
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Password changes are managed through email verification for security.
                  </p>
                  <Button variant="outline" disabled>
                    Change Password
                    <Mail className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Account Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Your account is active and verified.
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Active Account</span>
                  </div>
                </div>

                {profile?.is_admin && (
                  <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Administrator Access</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      You have administrator privileges for this store.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Methods</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Manage your payment methods for faster checkout
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Secure Payment Processing</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    All payment information is encrypted and stored securely. We never store your full card details.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/payment-methods'}
                    className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Payment Methods
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Accepted Methods</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    We accept all major credit cards, debit cards, and local payment methods.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white text-xs rounded border">Visa</span>
                    <span className="px-2 py-1 bg-white text-xs rounded border">Mastercard</span>
                    <span className="px-2 py-1 bg-white text-xs rounded border">PayFast</span>
                    <span className="px-2 py-1 bg-white text-xs rounded border">EFT</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}