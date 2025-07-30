'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardList, Trash2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/hooks/use-locale';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: Date;
}

const initialTasks: Task[] = [];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const { toast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
      try {
        const savedTasks = localStorage.getItem('tasks-data-v1');
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks, (key, value) => {
                if (key === 'dueDate' && typeof value === 'string') {
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? undefined : date;
                }
                return value;
            });
            setTasks(Array.isArray(parsedTasks) ? parsedTasks : initialTasks);
        } else {
            setTasks(initialTasks);
        }
      } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
          toast({
              variant: 'destructive',
              title: t('toast.error'),
              description: t('toast.loadingError')
          });
          setTasks(initialTasks);
      }
  }, [toast, t]);

  useEffect(() => {
    try {
        localStorage.setItem('tasks-data-v1', JSON.stringify(tasks));
    } catch (e) {
        console.error("Failed to save tasks to localStorage", e);
        toast({
            variant: 'destructive',
            title: t('toast.error'),
            description: t('toast.saveError')
        });
    }
  }, [tasks, toast, t]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.id - a.id; 
    });
  }, [tasks]);


  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    setTasks(prevTasks => [...prevTasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };
  
  const setDueDate = (id: number, date?: Date) => {
      setTasks(tasks.map((task) => (task.id === id ? { ...task, dueDate: date } : task)));
  }

  const isOverdue = (date?: Date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const isToday = (date?: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Recordatorios</CardTitle>
        </div>
        <CardDescription>Organiza tus tareas académicas, establece plazos y sigue tu progreso.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="flex items-center gap-2 mb-4">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Añadir una nueva tarea..."
            disabled={tasks.length > 50}
          />
          <Button type="submit" size="icon" disabled={tasks.length > 50}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Tarea</TableHead>
                <TableHead className="w-[200px]">Fecha Límite</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => (
                  <TableRow key={task.id} className={cn(task.completed && 'bg-muted/50 opacity-60')}>
                    <TableCell>
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        aria-label={`Marcar como ${task.completed ? 'incompleta' : 'completa'} la tarea ${task.text}`}
                      />
                    </TableCell>
                    <TableCell className={cn("font-medium", task.completed && 'text-muted-foreground line-through')}>
                      {task.text}
                    </TableCell>
                     <TableCell>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !task.dueDate && "text-muted-foreground",
                                    task.completed && "line-through"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {task.dueDate ? (
                                    <span className={cn(
                                        isOverdue(task.dueDate) && !task.completed && "text-red-600 font-bold",
                                        isToday(task.dueDate) && !task.completed && "text-blue-600 font-bold"
                                    )}>
                                       {format(task.dueDate, "PPP", { locale: es })}
                                    </span>
                                ) : (
                                    <span>Elige fecha</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={task.dueDate}
                                    onSelect={(date) => setDueDate(task.id, date)}
                                    initialFocus
                                    locale={es}
                                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                />
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                         <span className="sr-only">Eliminar tarea</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No hay tareas pendientes. ¡Buen trabajo!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
