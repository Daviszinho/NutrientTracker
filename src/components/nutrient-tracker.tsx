'use client';

import { useState, useEffect, type FC, type ReactElement, useRef, MutableRefObject } from 'react';
import Image from 'next/image';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

const NutrientTrackerSkeleton: FC = () => {
    return (
        <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 z-20 bg-background w-10"></TableHead>
                                <TableHead className="sticky left-10 z-20 bg-background min-w-[120px]"><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="sticky left-[170px] z-20 bg-background w-16"><Skeleton className="h-5 w-12" /></TableHead>
                                {DAYS_OF_WEEK.map(day => <TableHead key={day} className="text-center min-w-[110px]"><Skeleton className="h-5 w-16" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {INITIAL_NUTRIENT_CATEGORIES.map(category => (
                                <TableRow key={category}>
                                    <TableCell className="sticky left-0 z-10 bg-background"><Skeleton className="h-6 w-6" /></TableCell>
                                    <TableCell className="sticky left-10 z-10 bg-background"><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell className="sticky left-[170px] z-10 bg-background"><Skeleton className="h-10 w-12" /></TableCell>
                                    {DAYS_OF_WEEK.map(day => (
                                        <TableCell key={day} className="text-center">
                                            <div className="flex justify-center items-center gap-1">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-6 w-6" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

interface NutrientTrackerProps {
    trackerData: TrackerState;
    nutrientOrder: NutrientCategory[];
    isClient: boolean;
    handlePortionChange: (category: NutrientCategory, day: Day, newCount: number) => void;
    handleReset: () => void;
    dragItem: MutableRefObject<number | null>;
    dragOverItem: MutableRefObject<number | null>;
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
    const todayIndex = (new Date().getDay() + 6) % 7; // 0=Mon ... 6=Sun
    const today = DAYS_OF_WEEK[todayIndex];

    useEffect(() => {
        if (!isClient || !scrollRef.current) return;
        // Scroll so the today column is visible right after the sticky columns
        // Each day column is ~110px wide; sticky area is ~210px
        const stickyWidth = 210;
        const colWidth = 110;
        scrollRef.current.scrollLeft = todayIndex * colWidth;
    }, [isClient, todayIndex]);

    if (!isClient) {
        return <NutrientTrackerSkeleton />;
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <Image src={logo} alt="Nutrient Tracker Logo" width={32} height={32} />
                    <CardTitle className="text-2xl font-headline">Nutrient Tracker</CardTitle>
                </div>
                <CardDescription className="text-xs">Marque sus porciones diarias para cada categoría de nutrientes.</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
                <div ref={scrollRef} className="overflow-x-auto">
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                {/* Sticky: drag handle */}
                                <TableHead className="sticky left-0 z-20 bg-background w-8 p-1"></TableHead>
                                {/* Sticky: Nutriente */}
                                <TableHead className="sticky left-8 z-20 bg-background font-bold w-[120px] min-w-[120px] p-2 text-sm">
                                    Nutriente
                                </TableHead>
                                {/* Sticky: Máx */}
                                <TableHead className="sticky left-[128px] z-20 bg-background font-bold w-[52px] min-w-[52px] p-2 text-center text-sm">
                                    Máx.
                                </TableHead>
                                {/* Scrollable day columns */}
                                {DAYS_OF_WEEK.map(day => (
                                    <TableHead
                                        key={day}
                                        className={cn(
                                            "text-center font-bold min-w-[110px] w-[110px] p-2 text-sm",
                                            day === today ? "bg-sky-100/80 dark:bg-sky-900/40" : ""
                                        )}
                                    >
                                        {day}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {nutrientOrder.map((category, index) => (
                                <TableRow
                                    key={category}
                                    draggable
                                    onDragStart={() => dragItem.current = index}
                                    onDragEnter={() => dragOverItem.current = index}
                                    onDragEnd={handleDragSort}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="cursor-grab active:cursor-grabbing"
                                >
                                    {/* Sticky: drag handle */}
                                    <TableCell className="sticky left-0 z-10 bg-background p-1 text-center">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </TableCell>
                                    {/* Sticky: Nutriente name */}
                                    <TableCell className="sticky left-8 z-10 bg-background p-2">
                                        <div className="flex items-center gap-2">
                                            {NUTRIENT_CONFIG[category].icon}
                                            <span className="font-medium text-sm leading-tight">{NUTRIENT_CONFIG[category].name}</span>
                                        </div>
                                    </TableCell>
                                    {/* Sticky: max portions */}
                                    <TableCell className="sticky left-[128px] z-10 bg-background p-2 text-center">
                                        <span className="font-mono text-sm font-semibold">{trackerData[category].maxPortions}</span>
                                    </TableCell>
                                    {/* Scrollable day cells */}
                                    {DAYS_OF_WEEK.map(day => (
                                        <TableCell
                                            key={day}
                                            className={cn(
                                                "p-1",
                                                day === today ? "bg-sky-100/80 dark:bg-sky-900/40" : ""
                                            )}
                                        >
                                            <PortionCell
                                                count={trackerData[category].portions[day]}
                                                max={trackerData[category].maxPortions}
                                                onChange={(newCount) => handlePortionChange(category, day, newCount)}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
}

export default NutrientTracker;
