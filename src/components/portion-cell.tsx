'use client';

import { useState, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PortionCell: FC<{ count: number; max?: number; onChange: (newCount: number) => void }> = ({ count, max, onChange }) => {
    const [highlight, setHighlight] = useState(false);

    // Guarantee count is always a valid non-negative integer
    const safeCount = (typeof count === 'number' && !isNaN(count) && count >= 0) ? Math.floor(count) : 0;

    const handleChange = (newCount: number) => {
        onChange(newCount);
        setHighlight(true);
        setTimeout(() => setHighlight(false), 300);
    };

    const getColorClass = () => {
        if (max === undefined) return '';
        if (max === 0) return '';
        if (safeCount === max) return 'bg-red-200/50';
        if (safeCount === max - 1) return 'bg-yellow-200/50';
        if (safeCount < max - 1) return 'bg-green-200/50';
        return '';
    }

    return (
        <div className={cn("flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-300 rounded-md", highlight ? 'bg-accent/50' : '', getColorClass())}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleChange(safeCount - 1)} disabled={safeCount <= 0}>
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease portion</span>
            </Button>
            <span key={safeCount} className="font-mono text-base sm:text-lg w-6 text-center animate-in fade-in zoom-in-50 duration-300">{safeCount}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleChange(safeCount + 1)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase portion</span>
            </Button>
        </div>
    );
};
