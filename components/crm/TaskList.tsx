'use client';

import { useState } from 'react';
import { Task } from '@/lib/crm-data';
import { Check } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: `task-${Date.now()}`, title: newTask.trim(), completed: false },
    ]);
    setNewTask('');
  };

  const active = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-2">
      {/* Active tasks */}
      {active.map((task) => (
        <div key={task.id} className="flex items-start gap-3 py-1.5 group">
          <button
            onClick={() => toggle(task.id)}
            className="w-4 h-4 rounded border border-border hover:border-foreground flex-shrink-0 mt-0.5 transition-colors"
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm">{task.title}</span>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground ml-2">{task.dueDate}</span>
            )}
          </div>
        </div>
      ))}

      {/* Add task */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border border-dashed border-border flex-shrink-0" />
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Completed tasks */}
      {done.length > 0 && (
        <div className="pt-2 border-t border-border space-y-1.5">
          {done.map((task) => (
            <div key={task.id} className="flex items-start gap-3 py-1 opacity-50">
              <button
                onClick={() => toggle(task.id)}
                className="w-4 h-4 rounded bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <Check size={11} className="text-background" />
              </button>
              <span className="text-sm line-through text-muted-foreground">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
