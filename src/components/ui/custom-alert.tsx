'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  showAlert: (title: string, message: string) => void;
  hideAlert: () => void;
}

export const useAlert = create<AlertState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onClose: () => set({ isOpen: false }),
  showAlert: (title: string, message: string) => set({ isOpen: true, title, message }),
  hideAlert: () => set({ isOpen: false }),
}));

export function CustomAlert() {
  const { isOpen, title, message, hideAlert } = useAlert();

  return (
    <Dialog open={isOpen} onOpenChange={hideAlert}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={hideAlert} className="w-full sm:w-auto">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
