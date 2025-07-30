'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, PlusCircle, Circle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';

interface Event {
    id: number;
    date: Date;
    title: string;
    type: 'entrega' | 'examen' | 'presentacion';
}

const initialEvents: Event[] = [
    { id: 1, date: new Date(2024, 6, 15), title: 'Entrega: Ensayo Final', type: 'entrega' },
    { id: 2, date: new Date(2024, 6, 20), title: 'Examen: Matemáticas II', type: 'examen' },
    { id: 3, date: new Date(2024, 6, 22), title: 'Presentación: Proyecto de Física', type: 'presentacion' },
];

export default function AcademicCalendarPage() {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const { t } = useLocale();

    useEffect(() => {
        setDate(new Date());
    }, []);
    
    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'examen':
                return 'text-destructive'; // Uses theme variable
            case 'entrega':
                return 'text-primary'; // Uses theme variable
            case 'presentacion':
                return 'text-secondary-foreground'; // Use theme variable for consistency
            default:
                return 'text-muted-foreground';
        }
    }

    const handleDeleteEvent = (id: number) => {
        setEvents(events.filter(event => event.id !== id));
    };

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_350px]">
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline">{t('calendar.title')}</CardTitle>
                    </div>
                    <CardDescription>{t('calendar.description')}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>

            <div className="space-y-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-headline">{t('calendar.upcomingEvents')}</CardTitle>
                         <Button size="sm" variant="ghost">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {t('calendar.addEvent')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="flex items-start gap-3 group">
                                   <Circle className={`h-2 w-2 mt-1.5 ${getEventTypeColor(event.type)}`} fill="currentColor" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {event.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Badge variant={event.type === 'examen' ? 'destructive' : event.type === 'entrega' ? 'default' : 'secondary'} className="capitalize text-xs mr-2">{t(`calendar.eventTypes.${event.type}`)}</Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDeleteEvent(event.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                       </div>
                       {events.length === 0 && (
                           <p className="text-sm text-muted-foreground text-center py-8">{t('calendar.noEvents')}</p>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
