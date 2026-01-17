'use client';

import { useState, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PortionCell: FC<{ count: number; max?: number; onChange: (newCount: number) => void }> = ({ count, max, onChange }) => {
    const [highlight, setHighlight] = useState(false);

    const handleChange = (newCount: number) => {
        onChange(newCount);
        setHighlight(true);
        setTimeout(() => setHighlight(false), 300);
    };

    const getColorClass = () => {
        if (max === undefined) return '';
        if (max === 0) return '';
        if (count === max) return 'bg-red-200/50';
        if (count === max - 1) return 'bg-yellow-200/50';
        if (count < max - 1) return 'bg-green-200/50';
        return '';
    }

    return (
        <div className={cn("flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-300 rounded-md", highlight ? 'bg-accent/50' : '', getColorClass())}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleChange(count - 1)} disabled={count <= 0}>
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease portion</span>
            </Button>
            <span key={count} className="font-mono text-base sm:text-lg w-6 text-center animate-in fade-in zoom-in-50 duration-300">{count}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleChange(count + 1)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase portion</span>
            </Button>
        </div>
    );
};
