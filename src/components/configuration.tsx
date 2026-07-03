'use client';

import { useState, useEffect, type FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BellRing, Download } from 'lucide-react';
import type { TrackerState, NutrientCategory } from './main-app';
import { NUTRIENT_CONFIG } from './main-app';
import { PortionCell } from './portion-cell';

interface Meal {
    id: 'breakfast' | 'lunch' | 'dinner';
    name: string;
    time: string; // HH:mm format
    enabled: boolean;
}

const INITIAL_MEALS: Meal[] = [
    { id: 'breakfast', name: 'Desayuno', time: '09:00', enabled: true },
    { id: 'lunch', name: 'Almuerzo', time: '13:00', enabled: true },
    { id: 'dinner', name: 'Cena', time: '20:00', enabled: true },
];

declare class TimestampTrigger {
    constructor(timestamp: number);
}

interface ConfigurationProps {
    trackerData: TrackerState;
    handleMaxPortionChange: (category: NutrientCategory, newMax: number) => void;
    nutrientOrder: NutrientCategory[];
    isClient: boolean;
    installPrompt: Event | null;
    handleInstallClick: () => void;
}

const Configuration: FC<ConfigurationProps> = ({ trackerData, handleMaxPortionChange, nutrientOrder, isClient: dataIsReady, installPrompt, handleInstallClick }) => {
    const { toast } = useToast();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isClient, setIsClient] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if ('Notification' in window && 'serviceWorker' in navigator && 'showTrigger' in Notification.prototype) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }

        try {
            const savedMeals = localStorage.getItem('mealNotifications');
            setMeals(savedMeals ? JSON.parse(savedMeals) : INITIAL_MEALS);
        } catch (error) {
            console.error('Could not load meal data from local storage:', error);
            setMeals(INITIAL_MEALS);
        }
    }, []);
    
    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('mealNotifications', JSON.stringify(meals));
            } catch (error) {
                console.error('Could not save meal data to local storage:', error);
            }
        }
    }, [meals, isClient]);
    

    const handleRequestPermission = async () => {
        if (!isSupported) {
             toast({
                variant: 'destructive',
                title: 'Navegador no compatible',
                description: 'Tu navegador no soporta las notificaciones programadas.',
            });
            return;
        }

        const status = await Notification.requestPermission();
        setPermission(status);

        if (status === 'granted') {
            toast({ title: '¡Permiso concedido!', description: 'Ahora puedes guardar tu configuración de notificaciones.' });
            await handleSaveChanges();
        } else {
            toast({ variant: 'destructive', title: 'Permiso denegado', description: 'No se podrán enviar notificaciones.' });
        }
    };

    const handleSaveChanges = async () => {
        if (!isSupported || permission !== 'granted') {
            toast({ variant: 'destructive', title: 'Permiso Requerido', description: 'Por favor, permite las notificaciones primero.' });
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        const existingNotifications = await registration.getNotifications();
        existingNotifications.forEach(notification => notification.close());

        for (const meal of meals) {
            if (meal.enabled) {
                const [hours, minutes] = meal.time.split(':').map(Number);
                const notificationTime = new Date();
                notificationTime.setHours(hours, minutes, 0, 0);

                if (notificationTime.getTime() < Date.now()) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                }

                try {
                    await registration.showNotification(`Hora de tu ${meal.name.toLowerCase()}`, {
                        tag: meal.id,
                        body: 'No te olvides de registrar tu porción en Nutrient Tracker.',
                        showTrigger: new TimestampTrigger(notificationTime.getTime()),
                        silent: false,
                        icon: '/icon-192x192.png'
                    } as NotificationOptions);
                } catch (e) {
                    console.error(`Error scheduling notification for ${meal.name}:`, e);
                }
            }
        }
        
        toast({ title: 'Configuración Guardada', description: 'Tus recordatorios han sido actualizados.' });
    };

    const handleTimeChange = (id: Meal['id'], time: string) => {
        setMeals(prevMeals => prevMeals.map(meal => (meal.id === id ? { ...meal, time } : meal)));
    };

    const handleToggleChange = (id: Meal['id'], enabled: boolean) => {
        setMeals(prevMeals => prevMeals.map(meal => (meal.id === id ? { ...meal, enabled } : meal)));
    };
    
    if (!isClient && !dataIsReady) {
        return <Card className="mt-4"><CardHeader><CardTitle>Cargando configuración...</CardTitle></CardHeader></Card>;
    }
    
    return (
       <>
            {installPrompt && (
                <Card className="mt-4 w-full">
                    <CardHeader>
                        <CardTitle>Instalar Aplicación</CardTitle>
                        <CardDescription>
                            Instala esta aplicación en tu dispositivo para un acceso más rápido y uso sin conexión.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleInstallClick}>
                            <Download className="mr-2 h-4 w-4" />
                            Instalar Aplicación
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="mt-4 w-full">
                <CardHeader>
                    <CardTitle>Configuración de Notificaciones</CardTitle>
                    <CardDescription>
                        Recibe un recordatorio a la hora de cada comida para registrar tus porciones.
                        {permission === 'granted' && " Las notificaciones están activas."}
                        {permission === 'denied' && " Las notificaciones están bloqueadas por el navegador."}
                    </CardDescription>
                </CardHeader>
                {isSupported ? (
                    <>
                        <CardContent className="space-y-6">
                            {permission !== 'granted' && (
                                <div className="flex items-center space-x-2 rounded-lg border p-4">
                                    <BellRing className="h-6 w-6" />
                                    <div className="flex-grow">
                                        <p className="font-medium">Activar recordatorios</p>
                                        <p className="text-sm text-muted-foreground">
                                            {permission === 'default'
                                                ? 'Necesitamos tu permiso para enviarte notificaciones.'
                                                : 'Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.'}
                                        </p>
                                    </div>
                                    {permission === 'default' && (
                                        <Button onClick={handleRequestPermission}>Permitir</Button>
                                    )}
                                </div>
                            )}
                            
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Comida</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead className="text-right">Activar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {meals.map((meal) => (
                                        <TableRow key={meal.id}>
                                            <TableCell className="font-medium">{meal.name}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="time"
                                                    value={meal.time}
                                                    onChange={(e) => handleTimeChange(meal.id, e.target.value)}
                                                    className="w-[120px]"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Switch
                                                    checked={meal.enabled}
                                                    onCheckedChange={(checked) => handleToggleChange(meal.id, checked)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleSaveChanges} disabled={permission !== 'granted'}>
                                Guardar Cambios
                            </Button>
                        </CardFooter>
                    </>
                ) : (
                    <CardContent>
                         <CardDescription>
                            Tu navegador no soporta las notificaciones programadas. Por favor, intenta con una versión reciente de Chrome o Edge.
                        </CardDescription>
                    </CardContent>
                )}
            </Card>

            <Card className="mt-4 w-full">
                 <CardHeader>
                    <CardTitle>Porciones Máximas por Defecto</CardTitle>
                    <CardDescription>
                        Ajusta las porciones máximas recomendadas para cada nutriente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {dataIsReady ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/2">Nutriente</TableHead>
                                    <TableHead className="w-1/2 text-center">Porciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nutrientOrder.map((category) => (
                                    <TableRow key={category}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {NUTRIENT_CONFIG[category].icon}
                                                <span className="font-medium text-base">{NUTRIENT_CONFIG[category].name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <PortionCell
                                                    count={trackerData[category].maxPortions}
                                                    onChange={(newCount) => handleMaxPortionChange(category, newCount)}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>Cargando configuración...</p>
                    )}
                </CardContent>
            </Card>
       </>
    );
};

export default Configuration;
