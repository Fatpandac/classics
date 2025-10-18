import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogContext } from "./useDialog";

export type DialogOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({});

  const showDialog = (opts: DialogOptions) => {
    setOptions(opts);
    setOpen(true);
  };

  return (
    <DialogContext.Provider value={showDialog}>
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{options.title || "提示"}</DialogTitle>
            {options.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {options.cancelText || "取消"}
            </Button>
            <Button
              onClick={() => {
                options.onConfirm?.();
                setOpen(false);
              }}
            >
              {options.confirmText || "确定"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}

