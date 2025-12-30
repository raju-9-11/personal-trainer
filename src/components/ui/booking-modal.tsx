import React from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GymClass } from '@/lib/types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrainerSlug } from '@/components/TrainerContext'
import { Loader2 } from 'lucide-react'

interface BookingModalProps {
  gymClass: GymClass;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ gymClass, isOpen, onClose }: BookingModalProps) {
  const navigate = useNavigate();
  const slug = useTrainerSlug();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate "Processing"
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if price > 0 (assuming GymClass has a price field, or default to free if not)
    // For now, let's assume if it has a price field it is paid. The current type doesn't have price.
    // I will add price to the type definition in the next step, but for now let's pretend.
    const price = (gymClass as any).price || 0;

    if (price > 0) {
        setLoading(false);
        // Redirect to payment
        navigate(`/payment?amount=${price}&class=${encodeURIComponent(gymClass.title)}&trainer=${slug}`);
        return;
    }

    // Free Class - Success Logic
    // In a real app, call backend/EmailJS here
    console.log("Sending confirmation email to", formData.email, "for class", gymClass.title);

    setLoading(false);
    setSuccess(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
            <div className="py-6 text-center space-y-4">
                <div className="text-primary font-bold text-xl">Booking Confirmed!</div>
                <p className="text-muted-foreground">
                    You have successfully booked <strong>{gymClass.title}</strong>.
                    A confirmation email has been sent to {formData.email}.
                </p>
                <Button onClick={onClose} className="w-full">Done</Button>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                <DialogTitle>Book {gymClass.title}</DialogTitle>
                <DialogDescription>
                    Fill in your details to secure your spot.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                    Name
                    </Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                    Email
                    </Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                    Mobile
                    </Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="col-span-3" required />
                </div>
                </div>
                <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Booking
                </Button>
                </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
