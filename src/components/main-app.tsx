'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NutrientTracker from '@/components/nutrient-tracker';
import Configuration from '@/components/configuration';

export default function MainApp() {
    return (
        <div className="w-full max-w-7xl">
            <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-4">
                    <NutrientTracker />
                </TabsContent>
                <TabsContent value="settings">
                    <Configuration />
                </TabsContent>
            </Tabs>
        </div>
    );
}
