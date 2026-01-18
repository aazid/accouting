import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            border: '2px dashed var(--border)',
            textAlign: 'center',
            marginTop: '20px'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--bg-main)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginBottom: '20px'
            }}>
                <Icon size={32} style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.5' }}>{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn btn-primary"
                    style={{ height: '44px', padding: '0 24px' }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
