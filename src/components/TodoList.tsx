import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ListTodo,
  Sparkles,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { Task, ThemePalette } from '../types';

interface TodoListProps {
  theme: ThemePalette;
}

export const TodoList: React.FC<TodoListProps> = ({ theme }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('focus_wave_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', text: 'Completar sesión de lectura enfocada', completed: false, createdAt: Date.now(), priority: 'high' },
      { id: '2', text: 'Tomar 5 minutos de descanso consciente', completed: true, createdAt: Date.now() - 3600000, priority: 'medium' },
    ];
  });

  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    try {
      localStorage.setItem('focus_wave_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: input.trim(),
      completed: false,
      createdAt: Date.now(),
      priority,
    };

    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((t) => !t.completed));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div id="todo-list-card" className={`p-6 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} space-y-5 shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-white tracking-wide">Lista de Tareas</h2>
            <p className="text-xs text-slate-400">Planifica tus metas de la sesión</p>
          </div>
        </div>

        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
          >
            Limpiar completadas
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={addTask} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            id="new-task-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿En qué te enfocarás hoy?..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            id="add-task-btn"
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>

        {/* Priority Selector */}
        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
          <span>Prioridad:</span>
          {(['low', 'medium', 'high'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                priority === p
                  ? p === 'high'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : p === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700 text-slate-200 border border-slate-600'
                  : 'bg-slate-800/40 text-slate-500 hover:text-slate-300'
              }`}
            >
              {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
            </button>
          ))}
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800/80 pb-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-slate-800 text-cyan-300 font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-slate-800 text-cyan-300 font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pendientes ({tasks.filter((t) => !t.completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            filter === 'completed'
              ? 'bg-slate-800 text-cyan-300 font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Completadas ({completedCount})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-slate-600" />
            <p>No hay tareas en esta sección.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              id={`task-item-${task.id}`}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-slate-900/40 border-slate-800/50 text-slate-500'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-200 hover:border-slate-600'
              }`}
            >
              <div
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
              >
                {task.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 flex-shrink-0 group-hover:text-cyan-400" />
                )}
                <span
                  className={`text-sm truncate ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                  }`}
                >
                  {task.text}
                </span>

                {/* Priority Badge */}
                {task.priority && !task.completed && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                      task.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Med' : 'Baja'}
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                title="Eliminar tarea"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
