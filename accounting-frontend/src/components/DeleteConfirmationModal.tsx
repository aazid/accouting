import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(12px)',
            padding: '24px'
        }}>
            <div className="card glass-morphism animate-fade-in" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '40px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#fee2e2',
                    color: '#ef4444',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    transform: 'rotate(-10deg)'
                }}>
                    <AlertTriangle size={32} />
                </div>

                <h3 className="heading-2" style={{ marginBottom: '12px' }}>
                    Confirm Deletion
                </h3>

                <p className="text-label" style={{ marginBottom: '32px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    Are you sure you want to delete <span style={{ fontWeight: '800', color: '#ef4444' }}>"{itemName}"</span>?<br />
                    This action is <span style={{ fontWeight: '700' }}>permanent</span> and will remove this {itemType.toLowerCase()} from all records.
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn btn-outline"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={onClose}
                    >
                        No, Keep it
                    </button>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: '#ef4444',
                            color: 'white'
                        }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        <Trash2 size={18} /> Yes, Delete
                    </button>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
