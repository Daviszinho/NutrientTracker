'use client';

import { useState, useEffect, type FC, type ReactElement, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NutrientTracker from '@/components/nutrient-tracker';
import Configuration from '@/components/configuration';
import { Apple, Beef, Candy, Carrot, Droplets, Egg, Wheat } from 'lucide-react';

// Types and constants moved from NutrientTracker to be shared
type NutrientCategory = 'Agua' | 'Azucar' | 'Carbohidratos' | 'Proteina' | 'Fruta' | 'Grasa' | 'Vegetales';
export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;
type Day = (typeof DAYS_OF_WEEK)[number];

interface NutrientData {
    maxPortions: number;
    portions: Record<Day, number>;
}

export type TrackerState = Record<NutrientCategory, NutrientData>;

export const NUTRIENT_CONFIG: Record<NutrientCategory, { name: string; icon: ReactElement; defaultMax: number }> = {
    Agua: { name: 'Agua', icon: <Droplets className="h-5 w-5 text-muted-foreground" />, defaultMax: 8 },
    Azucar: { name: 'Azúcar', icon: <Candy className="h-5 w-5 text-muted-foreground" />, defaultMax: 0 },
    Carbohidratos: { name: 'Carbohidratos', icon: <Wheat className="h-5 w-5 text-muted-foreground" />, defaultMax: 5 },
    Proteina: { name: 'Proteína', icon: <Beef className="h-5 w-5 text-muted-foreground" />, defaultMax: 12 },
    Fruta: { name: 'Fruta', icon: <Apple className="h-5 w-5 text-muted-foreground" />, defaultMax: 3 },
    Grasa: { name: 'Grasa', icon: <Egg className="h-5 w-5 text-muted-foreground" />, defaultMax: 2 },
    Vegetales: { name: 'Vegetales', icon: <Carrot className="h-5 w-5 text-muted-foreground" />, defaultMax: 4 },
};
export const INITIAL_NUTRIENT_CATEGORIES = Object.keys(NUTRIENT_CONFIG) as NutrientCategory[];


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

export default function MainApp() {
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


    return (
        <div className="w-full max-w-7xl">
            <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-4">
                    <NutrientTracker
                        trackerData={trackerData}
                        nutrientOrder={nutrientOrder}
                        isClient={isClient}
                        handlePortionChange={handlePortionChange}
                        handleReset={handleReset}
                        dragItem={dragItem}
                        dragOverItem={dragOverItem}
                        handleDragSort={handleDragSort}
                    />
                </TabsContent>
                <TabsContent value="settings">
                    <Configuration 
                        trackerData={trackerData}
                        nutrientOrder={nutrientOrder}
                        isClient={isClient}
                        handleMaxPortionChange={handleMaxPortionChange}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
