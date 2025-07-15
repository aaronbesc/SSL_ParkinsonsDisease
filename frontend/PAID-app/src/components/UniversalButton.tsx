import React from 'react';
//Remember that the file and function needs to start with a capital letter

interface UniversalButtonProps{
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}

export default function UniversalButton({
    onClick,
    disabled = false,
    className = '',
    children,
}: UniversalButtonProps){
    return(
        <button
            onClick={onClick}
            disabled = {disabled}
            className={className}
        >
            {children}
        </button>
    )
}