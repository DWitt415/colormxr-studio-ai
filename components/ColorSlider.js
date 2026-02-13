// ColorSlider.js
'use client'

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

const ColorSlider = ({ svg, color, value, onChange }) => {
    const [dragging, setDragging] = useState(false);
    const sliderRef = useRef(null);

    const handleEvent = (e) => {
        if (dragging) {
            const rect = sliderRef.current.getBoundingClientRect();
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let newValue = Math.round(((rect.bottom - clientY) / rect.height) * 255);
            newValue = Math.min(Math.max(newValue, 0), 255); // Ensure value is within bounds
            onChange(newValue);
        }
    };

    const handleEndEvent = () => {
        setDragging(false);
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleEvent);
        document.addEventListener('mouseup', handleEndEvent);
        document.addEventListener('touchmove', handleEvent);
        document.addEventListener('touchend', handleEndEvent);

        return () => {
            document.removeEventListener('mousemove', handleEvent);
            document.removeEventListener('mouseup', handleEndEvent);
            document.removeEventListener('touchmove', handleEvent);
            document.removeEventListener('touchend', handleEndEvent);
        };
    }, [dragging, onChange]);

    const handleStartEvent = (e) => {
        setDragging(true);
        e.preventDefault(); // Prevent default behavior to avoid selection of the icon text
    };

    const sliderPosition = ((255 - value) / 255) * 100;

    return (
        <div className="flex flex-col items-center space-y-0 w-10" style={{ userSelect: 'none', touchAction: 'manipulation' }}>
            <div
                ref={sliderRef}
                className="h-64 w-12 relative cursor-pointer flex flex-col items-center bg-background rounded-md"
                onMouseDown={handleStartEvent}
                onTouchStart={handleStartEvent}
            >
                <div
                    style={{ background: `linear-gradient(to top, black, ${color})` }}
                    className='h-full w-[3px]'>
                </div>
                
                <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-7 h-7"
                    style={{ top: `${sliderPosition}%`, pointerEvents: dragging ? 'none' : 'auto' }}
                >
                    <Image
                        src={svg}
                        alt="Slider Icon"
                        onMouseDown={handleStartEvent} // This is to start dragging when clicking the icon
                        onTouchStart={handleStartEvent}
                        style={{ marginTop: '-1rem' }}
                        width={36}
                        height={36}
                    />
                </div>
            </div>
        </div>
    );
};

export default ColorSlider;