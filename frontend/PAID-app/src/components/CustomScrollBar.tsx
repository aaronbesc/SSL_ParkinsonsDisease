import React from "react";

interface CustomScrollBarProps{
    children: React.ReactNode;
    className?: string;
}

export default function CustomScrollBar({
    children,
    className = ''
}: CustomScrollBarProps) {
    return (
        <div
            className={className}
            style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 #ccc'
            }}
        >
            {children}
        </div>
    )
}