
'use client';

import { useState, useEffect, type FC, type ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Apple, Beef, Candy, Carrot, Egg, Droplets, Minus, Plus, Wheat } from 'lucide-react';

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
  Azucar: { name: 'Azúcar', icon: <Candy className="h-5 w-5 text-muted-foreground" />, defaultMax: 2 },
  Carbohidratos: { name: 'Carbohidratos', icon: <Wheat className="h-5 w-5 text-muted-foreground" />, defaultMax: 5 },
  Proteina: { name: 'Proteína', icon: <Beef className="h-5 w-5 text-muted-foreground" />, defaultMax: 4 },
  Fruta: { name: 'Fruta', icon: <Apple className="h-5 w-5 text-muted-foreground" />, defaultMax: 3 },
  Grasa: { name: 'Grasa', icon: <Egg className="h-5 w-5 text-muted-foreground" />, defaultMax: 2 },
  Vegetales: { name: 'Vegetales', icon: <Carrot className="h-5 w-5 text-muted-foreground" />, defaultMax: 5 },
};
const NUTRIENT_CATEGORIES = Object.keys(NUTRIENT_CONFIG) as NutrientCategory[];


const getInitialState = (): TrackerState => {
    const initialState: Partial<TrackerState> = {};
    for (const category of NUTRIENT_CATEGORIES) {
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
                                <TableHead className="min-w-[150px]"><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="min-w-[120px]"><Skeleton className="h-5 w-24" /></TableHead>
                                {DAYS_OF_WEEK.map(day => <TableHead key={day} className="text-center"><Skeleton className="h-5 w-16" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {NUTRIENT_CATEGORIES.map(category => (
                                <TableRow key={category}>
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

const PortionCell: FC<{ count: number; max: number; onChange: (newCount: number) => void }> = ({ count, max, onChange }) => {
    const [highlight, setHighlight] = useState(false);

    const handleChange = (newCount: number) => {
        onChange(newCount);
        setHighlight(true);
        setTimeout(() => setHighlight(false), 300);
    };
    
    const getColorClass = () => {
        if (max === 0) return '';
        if (count >= max) return 'bg-red-200/50';
        if (count >= max - 1) return 'bg-yellow-200/50';
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const savedData = sessionStorage.getItem('nutrientTrackerData');
            if (savedData) {
                setTrackerData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error('Could not load data from session storage:', error);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                sessionStorage.setItem('nutrientTrackerData', JSON.stringify(trackerData));
            } catch (error) {
                console.error('Could not save data to session storage:', error);
            }
        }
    }, [trackerData, isClient]);

    const handleMaxPortionChange = (category: NutrientCategory, value: string) => {
        const newMax = parseInt(value, 10);
        if (!isNaN(newMax) && newMax >= 0) {
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
                                <TableHead className="font-bold min-w-[180px] text-base">Nutriente</TableHead>
                                <TableHead className="font-bold min-w-[140px] text-base">Porciones Máx.</TableHead>
                                {DAYS_OF_WEEK.map(day => (
                                    <TableHead key={day} className="text-center font-bold min-w-[120px] text-base">{day}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {NUTRIENT_CATEGORIES.map(category => (
                                <TableRow key={category}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {NUTRIENT_CONFIG[category].icon}
                                            <span className="font-medium text-base">{NUTRIENT_CONFIG[category].name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={trackerData[category].maxPortions}
                                            onChange={(e) => handleMaxPortionChange(category, e.target.value)}
                                            className="w-24 h-10"
                                            aria-label={`Max portions for ${category}`}
                                        />
                                    </TableCell>
                                    {DAYS_OF_WEEK.map(day => (
                                        <TableCell key={day}>
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
        </Card>
    );
}

    