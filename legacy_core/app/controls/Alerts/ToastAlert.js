import React from 'react';
import { ToastBar, Toaster } from 'react-hot-toast';

export default function ToastAlert() {
    return (
        <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
                duration: 3000,
                success: {
                    style: {
                        background: '#d3f3df',
                        color: '#22c55e',
                        border: '1px solid black'
                    }
                },
            }}
        >
            {(t) => (
                <ToastBar
                    toast={t}
                    style={{
                        ...t.style,
                        animation: t.visible ? 'custom-enter 1s ease' : 'custom-exit 1s ease',
                    }}
                />
            )}
        </Toaster>
    );
}