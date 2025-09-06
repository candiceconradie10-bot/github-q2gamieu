import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'bank' | 'ewallet';
  provider: string;
  last_four: string;
  is_default: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState<'card' | 'bank' | 'ewallet'>('card');

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (formData: {
    type: 'card' | 'bank' | 'ewallet';
    provider: string;
    lastFour: string;
    expiresAt?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: formData.type,
          provider: formData.provider,
          last_four: formData.lastFour,
          expires_at: formData.expiresAt || null,
          is_default: paymentMethods.length === 0, // First payment method is default
        });

      if (error) throw error;

      toast.success('Payment method added successfully');
      loadPaymentMethods();
      setIsAddingPayment(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId);

      if (error) throw error;

      toast.success('Payment method deleted');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!user) return;

    try {
      // Remove default from all payment methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId);

      if (error) throw error;

      toast.success('Default payment method updated');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank':
        return <CreditCard className="h-5 w-5" />;
      case 'ewallet':
        return <Shield className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const formatExpiryDate = (expiresAt: string) => {
    const date = new Date(expiresAt);
    return date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to manage your payment methods.</p>
            <Button onClick={() => window.location.href = '/'}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Methods</h1>
          <p className="text-gray-400">Manage your payment methods for faster checkout</p>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold">Secure & Encrypted</h3>
                <p className="text-gray-300 text-sm">All payment information is encrypted and stored securely. We never store your full card details.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Existing Payment Methods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Saved Methods</h2>
              <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </DialogTrigger>
                <AddPaymentMethodDialog 
                  onAdd={handleAddPaymentMethod}
                  type={newPaymentType}
                  onTypeChange={setNewPaymentType}
                />
              </Dialog>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-gray-800/50">
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : paymentMethods.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-white font-semibold mb-2">No Payment Methods</h3>
                  <p className="text-gray-400 mb-4">Add a payment method to make checkout faster</p>
                </CardContent>
              </Card>
            ) : (
              paymentMethods.map((method) => (
                <Card key={method.id} className="bg-gray-800/50 border-gray-700 hover:border-brand-red/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-700/50 rounded-lg">
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              {method.provider} ••••{method.last_four}
                            </span>
                            {method.is_default && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-gray-400 text-sm capitalize">
                              {method.type}
                            </span>
                            {method.expires_at && (
                              <span className="text-gray-400 text-sm">
                                Expires {formatExpiryDate(method.expires_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Payment Options Info */}
          <div className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  Accepted Payment Methods
                </CardTitle>
                <CardDescription>We accept the following payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-blue-400" />
                    <span className="text-white text-sm">Credit Cards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-green-400" />
                    <span className="text-white text-sm">Debit Cards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-white text-sm">PayFast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-orange-400" />
                    <span className="text-white text-sm">EFT</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold">Development Notice</h3>
                    <p className="text-gray-300 text-sm">Payment integration is currently in development. For now, orders will use manual payment processing.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPaymentMethodDialog({ 
  onAdd, 
  type, 
  onTypeChange 
}: { 
  onAdd: (data: any) => void;
  type: 'card' | 'bank' | 'ewallet';
  onTypeChange: (type: 'card' | 'bank' | 'ewallet') => void;
}) {
  const [formData, setFormData] = useState({
    provider: '',
    lastFour: '',
    expiryMonth: '',
    expiryYear: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expiresAt = type === 'card' && formData.expiryMonth && formData.expiryYear 
      ? `${formData.expiryYear}-${formData.expiryMonth.padStart(2, '0')}-01`
      : undefined;

    onAdd({
      type,
      provider: formData.provider,
      lastFour: formData.lastFour,
      expiresAt
    });

    setFormData({ provider: '', lastFour: '', expiryMonth: '', expiryYear: '' });
  };

  const getProviderOptions = () => {
    switch (type) {
      case 'card':
        return ['Visa', 'Mastercard', 'American Express'];
      case 'bank':
        return ['Standard Bank', 'FNB', 'Nedbank', 'ABSA', 'Capitec'];
      case 'ewallet':
        return ['PayFast', 'Ozow', 'Zapper'];
      default:
        return [];
    }
  };

  return (
    <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
      <DialogHeader>
        <DialogTitle className="text-white">Add Payment Method</DialogTitle>
        <DialogDescription>
          Add a new payment method for faster checkout
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type" className="text-white">Payment Type</Label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="bank">Bank Account</SelectItem>
              <SelectItem value="ewallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="provider" className="text-white">Provider</Label>
          <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {getProviderOptions().map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lastFour" className="text-white">
            Last 4 Digits
          </Label>
          <Input
            id="lastFour"
            value={formData.lastFour}
            onChange={(e) => setFormData(prev => ({ ...prev, lastFour: e.target.value.slice(0, 4) }))}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="1234"
            maxLength={4}
            required
          />
        </div>

        {type === 'card' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="expiryMonth" className="text-white">Month</Label>
              <Select value={formData.expiryMonth} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryMonth: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Array.from({length: 12}, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{(i+1).toString().padStart(2, '0')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiryYear" className="text-white">Year</Label>
              <Select value={formData.expiryYear} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryYear: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Array.from({length: 10}, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="submit"
            className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
            disabled={!formData.provider || !formData.lastFour}
          >
            Add Payment Method
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}