import { Modal } from '../common/Modal';
import { TransactionForm } from './TransactionForm';

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData = null,
  isLoading = false,
}) {
  const handleSubmit = async (formData) => {
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add New Transaction'}
      size="lg"
    >
      <TransactionForm
        categories={categories}
        onSubmit={handleSubmit}
        initialData={initialData}
        isLoading={isLoading}
      />
    </Modal>
  );
}

export default TransactionModal;