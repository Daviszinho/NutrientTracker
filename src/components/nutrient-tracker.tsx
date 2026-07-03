'use client';

import { useEffect, type FC, useRef, RefObject } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GripVertical, RotateCcw } from 'lucide-react';
import { PortionCell } from './portion-cell';
import type { TrackerState, NutrientCategory } from './main-app';
import { DAYS_OF_WEEK, NUTRIENT_CONFIG, INITIAL_NUTRIENT_CATEGORIES } from './main-app';
import logo from '@/app/nt.png';

type Day = (typeof DAYS_OF_WEEK)[number];

// Row height in px — must match between fixed and scroll tables
const ROW_H = 56;
const HEADER_H = 40;

const NutrientTrackerSkeleton: FC = () => (
    <Card className="w-full">
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
            <div className="flex">
                {/* Fixed left skeleton */}
                <div className="shrink-0 w-[180px]">
                    <div style={{ height: HEADER_H }} className="flex items-center px-2 border-b bg-muted/50">
                        <Skeleton className="h-4 w-20" />
                    </div>
                    {INITIAL_NUTRIENT_CATEGORIES.map(cat => (
                        <div key={cat} style={{ height: ROW_H }} className="flex items-center px-2 border-b">
                            <Skeleton className="h-5 w-28" />
                        </div>
                    ))}
                </div>
                {/* Fixed max skeleton */}
                <div className="shrink-0 w-[52px] border-r shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)]">
                    <div style={{ height: HEADER_H }} className="flex items-center justify-center border-b bg-muted/50">
                        <Skeleton className="h-4 w-8" />
                    </div>
                    {INITIAL_NUTRIENT_CATEGORIES.map(cat => (
                        <div key={cat} style={{ height: ROW_H }} className="flex items-center justify-center border-b">
                            <Skeleton className="h-5 w-6" />
                        </div>
                    ))}
                </div>
                {/* Scrollable days skeleton */}
                <div className="overflow-x-auto flex-1">
                    <div className="flex">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="shrink-0 w-[110px]">
                                <div style={{ height: HEADER_H }} className="flex items-center justify-center border-b bg-muted/50">
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                {INITIAL_NUTRIENT_CATEGORIES.map(cat => (
                                    <div key={cat} style={{ height: ROW_H }} className="flex items-center justify-center border-b gap-1">
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-5 w-5" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

interface NutrientTrackerProps {
    trackerData: TrackerState;
    nutrientOrder: NutrientCategory[];
    isClient: boolean;
    handlePortionChange: (category: NutrientCategory, day: Day, newCount: number) => void;
    handleReset: () => void;
    dragItem: RefObject<number | null>;
    dragOverItem: RefObject<number | null>;
    handleDragSort: () => void;
}

const NutrientTracker: FC<NutrientTrackerProps> = ({
    trackerData,
    nutrientOrder,
    isClient,
    handlePortionChange,
    handleReset,
    dragItem,
    dragOverItem,
    handleDragSort,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const todayIndex = (new Date().getDay() + 6) % 7; // 0=Mon…6=Sun
    const today = DAYS_OF_WEEK[todayIndex];

    useEffect(() => {
        if (!isClient || !scrollRef.current) return;
        const colWidth = 110;
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = todayIndex * colWidth;
            }
        }, 100);
    }, [isClient, todayIndex]);

    if (!isClient) return <NutrientTrackerSkeleton />;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <Image src={logo} alt="Nutrient Tracker Logo" width={32} height={32} />
                    <CardTitle className="text-2xl font-headline">Nutrient Tracker</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Marque sus porciones diarias para cada categoría de nutrientes.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-2 pb-2">
                {/* Outer flex: fixed columns | scrollable days */}
                <div className="flex w-full">

                    {/* ── FIXED: drag + nutrient name ─────────────────── */}
                    <div className="shrink-0 w-[172px] z-10 bg-card">
                        {/* Header */}
                        <div
                            style={{ height: HEADER_H }}
                            className="flex items-center px-2 border-b font-bold text-sm text-muted-foreground"
                        >
                            Nutriente
                        </div>
                        {/* Rows */}
                        {nutrientOrder.map((category, index) => (
                            <div
                                key={category}
                                style={{ height: ROW_H }}
                                draggable
                                onDragStart={() => dragItem.current = index}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                                className="flex items-center gap-1 px-1 border-b cursor-grab active:cursor-grabbing"
                            >
                                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                                {NUTRIENT_CONFIG[category].icon}
                                <span className="font-medium text-xs leading-tight truncate">
                                    {NUTRIENT_CONFIG[category].name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ── FIXED: max portions — with right shadow ───────── */}
                    <div className="shrink-0 w-[48px] z-10 bg-card shadow-[3px_0_8px_-3px_rgba(0,0,0,0.2)]">
                        {/* Header */}
                        <div
                            style={{ height: HEADER_H }}
                            className="flex items-center justify-center border-b font-bold text-xs text-muted-foreground"
                        >
                            Máx.
                        </div>
                        {/* Rows */}
                        {nutrientOrder.map((category) => (
                            <div
                                key={category}
                                style={{ height: ROW_H }}
                                className="flex items-center justify-center border-b"
                            >
                                <span className="font-mono text-sm font-semibold">
                                    {trackerData[category].maxPortions}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ── SCROLLABLE: day columns ───────────────────────── */}
                    <div ref={scrollRef} className="overflow-x-auto flex-1">
                        <div className="flex" style={{ minWidth: `${DAYS_OF_WEEK.length * 110}px` }}>
                            {DAYS_OF_WEEK.map((day) => (
                                <div
                                    key={day}
                                    className={cn(
                                        'shrink-0 w-[110px]',
                                        day === today ? 'bg-sky-100/80 dark:bg-sky-900/40' : ''
                                    )}
                                >
                                    {/* Day header */}
                                    <div
                                        style={{ height: HEADER_H }}
                                        className="flex items-center justify-center border-b font-bold text-xs"
                                    >
                                        {day}
                                    </div>
                                    {/* Portion cells */}
                                    {nutrientOrder.map((category) => (
                                        <div
                                            key={category}
                                            style={{ height: ROW_H }}
                                            className="flex items-center justify-center border-b"
                                        >
                                            <PortionCell
                                                count={trackerData[category].portions[day]}
                                                max={trackerData[category].maxPortions}
                                                onChange={(newCount) =>
                                                    handlePortionChange(category, day, newCount)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-end pt-2">
                <Button onClick={handleReset} variant="outline" size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resetear
                </Button>
            </CardFooter>
        </Card>
    );
};

export default NutrientTracker;
