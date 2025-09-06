import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { wishlist } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export function WishlistButton({ 
  productId, 
  className,
  size = 'md',
  variant = 'ghost'
}: WishlistButtonProps) {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if item is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user) return;
      
      try {
        const inWishlist = await wishlist.isInWishlist(user.id, productId);
        setIsInWishlist(inWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [user, productId]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to use the wishlist');
      return;
    }

    setLoading(true);
    
    try {
      if (isInWishlist) {
        await wishlist.remove(user.id, productId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlist.add(user.id, productId);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={handleWishlistToggle}
      disabled={loading}
      className={cn(
        'transition-all duration-200 hover:scale-105',
        isInWishlist && 'text-red-500 hover:text-red-600',
        !isInWishlist && 'text-gray-400 hover:text-red-500',
        className
      )}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          iconSize,
          'transition-all duration-200',
          isInWishlist ? 'fill-current' : '',
          loading && 'animate-pulse'
        )} 
      />
      {size === 'lg' && (
        <span className="ml-2">
          {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        </span>
      )}
    </Button>
  );
}