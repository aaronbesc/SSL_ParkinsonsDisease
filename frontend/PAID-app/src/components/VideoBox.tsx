import React from "react";

//defines what is inside the object
//? makes the property optional
interface VideoBoxProps{
    src: string;
    controls?: boolean;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    className?: string;
}

export default function VideoBox({
    src,
    controls = true,
    autoPlay = false,
    loop = false,
    muted = true,
    className = '',
}: VideoBoxProps){
    return (
        <video
            src = {src}
            controls = {controls}
            autoPlay = {autoPlay}
            loop = {loop}
            muted = {muted}
            className = {className}

            style={{
                width: '100%', // might have to use 2rem
                height: 'auto'
            }}
        />
    )
}