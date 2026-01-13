
'use client';

import { useState, useEffect, type FC, type ReactElement, useRef } from 'react';
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
import { Apple, Beef, Candy, Carrot, Droplets, Egg, GripVertical, Minus, Plus, RotateCcw, Wheat } from 'lucide-react';

type NutrientCategory = 'Agua' | 'Azucar' | 'Carbohidratos' | 'Proteina' | 'Fruta' | 'Grasa' | 'Vegetales';
const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;
type Day = (typeof DAYS_OF_WEEK)[number];

interface NutrientData {
    maxPortions: number;
    portions: Record<Day, number>;
}

type TrackerState = Record<NutrientCategory, NutrientData>;

const NUTRIENT_CONFIG: Record<NutrientCategory, { name: string; icon: ReactElement; defaultMax: number }> = {
    Agua: { name: 'Agua', icon: <Droplets className="h-5 w-5 text-muted-foreground" />, defaultMax: 8 },
    Azucar: { name: 'Azúcar', icon: <Candy className="h-5 w-5 text-muted-foreground" />, defaultMax: 0 },
    Carbohidratos: { name: 'Carbohidratos', icon: <Wheat className="h-5 w-5 text-muted-foreground" />, defaultMax: 5 },
    Proteina: { name: 'Proteína', icon: <Beef className="h-5 w-5 text-muted-foreground" />, defaultMax: 12 },
    Fruta: { name: 'Fruta', icon: <Apple className="h-5 w-5 text-muted-foreground" />, defaultMax: 3 },
    Grasa: { name: 'Grasa', icon: <Egg className="h-5 w-5 text-muted-foreground" />, defaultMax: 2 },
    Vegetales: { name: 'Vegetales', icon: <Carrot className="h-5 w-5 text-muted-foreground" />, defaultMax: 4 },
};
const INITIAL_NUTRIENT_CATEGORIES = Object.keys(NUTRIENT_CONFIG) as NutrientCategory[];


const getInitialState = (): TrackerState => {
    const initialState: Partial<TrackerState> = {};
    for (const category of INITIAL_NUTRIENT_CATEGORIES) {
        const portions: Partial<Record<Day, number>> = {};
        for (const day of DAYS_OF_WEEK) {
            portions[day] = 0;
        }
        initialState[category] = {
            maxPortions: NUTRIENT_CONFIG[category].defaultMax,
            portions: portions as Record<Day, number>,
        };
    }
    return initialState as TrackerState;
};

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

const PortionCell: FC<{ count: number; max?: number; onChange: (newCount: number) => void }> = ({ count, max, onChange }) => {
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

export default function NutrientTracker() {
    const [trackerData, setTrackerData] = useState<TrackerState>(getInitialState());
    const [nutrientOrder, setNutrientOrder] = useState<NutrientCategory[]>(INITIAL_NUTRIENT_CATEGORIES);
    const [isClient, setIsClient] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);


    useEffect(() => {
        setIsClient(true);
        try {
            const savedData = localStorage.getItem('nutrientTrackerData');
            const savedOrder = localStorage.getItem('nutrientTrackerOrder');
            if (savedData) {
                setTrackerData(JSON.parse(savedData));
            }
            if (savedOrder) {
                setNutrientOrder(JSON.parse(savedOrder));
            }
        } catch (error) {
            console.error('Could not load data from local storage:', error);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('nutrientTrackerData', JSON.stringify(trackerData));
                localStorage.setItem('nutrientTrackerOrder', JSON.stringify(nutrientOrder));
            } catch (error) {
                console.error('Could not save data to local storage:', error);
            }
        }
    }, [trackerData, nutrientOrder, isClient]);

    const handleMaxPortionChange = (category: NutrientCategory, newMax: number) => {
        if (newMax >= 0) {
            setTrackerData(prev => ({
                ...prev,
                [category]: { ...prev[category], maxPortions: newMax },
            }));
        }
    };

    const handlePortionChange = (category: NutrientCategory, day: Day, newCount: number) => {
        setTrackerData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                portions: { ...prev[category].portions, [day]: newCount },
            },
        }));
    };

    const handleReset = () => {
        setTrackerData(prev => {
            const newState = { ...prev };
            for (const category of INITIAL_NUTRIENT_CATEGORIES) {
                const newPortions: Partial<Record<Day, number>> = {};
                for (const day of DAYS_OF_WEEK) {
                    newPortions[day] = 0;
                }
                newState[category] = {
                    ...newState[category],
                    portions: newPortions as Record<Day, number>,
                };
            }
            return newState;
        });
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newNutrientOrder = [...nutrientOrder];
        const draggedItemContent = newNutrientOrder.splice(dragItem.current, 1)[0];
        newNutrientOrder.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setNutrientOrder(newNutrientOrder);
    };


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
                                        <PortionCell
                                            count={trackerData[category].maxPortions}
                                            onChange={(newCount) => handleMaxPortionChange(category, newCount)}
                                        />
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
