import { useBoolean } from "usehooks-ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Button } from "@/_components/ui/button";

interface ConfirmationModalProps {
  defaultIsOpen?: boolean;
  title: string;
  description?: string | React.ReactNode;
  onConfirm?(): void;
  onCancel?(): void;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  defaultIsOpen = true,
  title,
  description,
  onConfirm,
  onCancel,
  cancelButtonText = "Cancel",
  confirmButtonText = "Confirm",
}) => {
  const { value: isOpenDialog, setValue: setIsOpenDialog } =
    useBoolean(defaultIsOpen);

  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div>{description ?? "Are you share you want to do this action?"}</div>

        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              setIsOpenDialog(false);
            }}
          >
            {cancelButtonText}
          </Button>

          <Button
            onClick={() => {
              onConfirm?.();
              setIsOpenDialog(false);
            }}
          >
            {confirmButtonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
