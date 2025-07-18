import React from 'react';
import { useConfirmationContext } from '../providers/ConfirmationContext';
import ConfirmAlert from '../controls/Alerts/ConfirmAlert';

export default function ConfirmationWrapper({ children }) {
  const { confirmation } = useConfirmationContext();

  return (
    <div>
      {children}
      <ConfirmAlert confirmation={confirmation} />
    </div>
  );
}
