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

export default function