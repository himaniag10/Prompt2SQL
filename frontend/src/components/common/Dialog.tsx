import React from 'react';
import { Modal, ModalProps } from './Modal';

// Dialog is a stylized wrapper around Modal for specific alert/confirm flows
export interface DialogProps extends ModalProps {
  description?: string;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ description, footer, children, ...props }) => {
  return (
    <Modal {...props} className="max-w-md">
      <div className="space-y-4">
        {description && <p className="text-sm text-muted">{description}</p>}
        <div>{children}</div>
      </div>
      {footer && (
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
          {footer}
        </div>
      )}
    </Modal>
  );
};
