'use client';

import { useState, useEffect, type FC, type ReactElement, useRef, MutableRefObject } from 'react';
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

type Day = (typeof DAYS_OF_WEEK)[number];

const NutrientTrackerSkeleton: FC = () => {
    return (
        <Card className="w-full max-w-7xl">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead className="min-w-[150px]"><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="min-w-[120px]"><Skeleton className="h-5 w-24" /></TableHead>
                                {DAYS_OF_WEEK.map(day => <TableHead key={day} className="text-center"><Skeleton className="h-5 w-16" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {INITIAL_NUTRIENT_CATEGORIES.map(category => (
                                <TableRow key={category}>
                                    <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                                    {DAYS_OF_WEEK.map(day => (
                                        <TableCell key={day} className="text-center">
                                            <div className="flex justify-center items-center gap-2">
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

    if (!isClient) {
        return <NutrientTrackerSkeleton />;
    }

    return (
        <Card className="w-full max-w-7xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Nutrient Tracker</CardTitle>
                <CardDescription>Marque sus porciones diarias para cada categoría de nutrientes a continuación.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead className="font-bold min-w-[180px] text-base">Nutriente</TableHead>
                                <TableHead className="font-bold min-w-[140px] text-base">Porciones Máx.</TableHead>
                                {DAYS_OF_WEEK.map(day => (
                                    <TableHead
                                        key={day}
                                        className={cn(
                                            "text-center font-bold min-w-[120px] text-base",
                                            isClient && day === DAYS_OF_WEEK[(new Date().getDay() + 6) % 7] ? "bg-sky-100/50 dark:bg-sky-900/30" : ""
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
                                    <TableCell className="text-center">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {NUTRIENT_CONFIG[category].icon}
                                            <span className="font-medium text-base">{NUTRIENT_CONFIG[category].name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            <span className="font-mono text-base sm:text-lg w-6 text-center">{trackerData[category].maxPortions}</span>
                                        </div>
                                    </TableCell>
                                    {DAYS_OF_WEEK.map(day => (
                                        <TableCell
                                            key={day}
                                            className={cn(
                                                isClient && day === DAYS_OF_WEEK[(new Date().getDay() + 6) % 7] ? "bg-sky-100/50 dark:bg-sky-900/30" : ""
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
            <CardFooter className="flex justify-end">
                <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resetear
                </Button>
            </CardFooter>
        </Card>
    );
}

export default NutrientTracker;
