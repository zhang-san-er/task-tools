import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType, TaskFormData } from '../types/task';
import { isExpired } from '../utils/dateUtils';

interface TaskState {
  tasks: Task[];
  addTask: (taskData: TaskFormData) => void;
  toggleTaskCompletion: (id: string) => void;
  startTask: (id: string) => void; // 开始任务（支付入场费）
  deleteTask: (id: string) => void;
  getTasksByType: (type: TaskType) => Task[];
  getExpiredTasks: () => Task[];
  getTodayTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData: TaskFormData) => {
        const newTask: Task = {
          id: crypto.randomUUID(),
          name: taskData.name,
          type: taskData.type,
          isCompleted: false,
          points: taskData.points,
          entryCost: taskData.type === 'demon' ? (taskData.entryCost || 0) : undefined,
          isStarted: false,
          createdAt: new Date(),
          expiresAt: taskData.expiresAt,
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },
      
      startTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isStarted: true,
                }
              : task
          ),
        }));
      },
      
      toggleTaskCompletion: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isCompleted: !task.isCompleted,
                  completedAt: task.isCompleted ? undefined : new Date(),
                }
              : task
          ),
        }));
      },
      
      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      getTasksByType: (type: TaskType) => {
        return get().tasks.filter((task) => task.type === type);
      },
      
      getExpiredTasks: () => {
        return get().tasks.filter(
          (task) => task.expiresAt && isExpired(task.expiresAt) && !task.isCompleted
        );
      },
      
      getTodayTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().tasks.filter((task) => {
          if (!task.expiresAt) return false;
          const taskDate = new Date(task.expiresAt);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
      },
    }),
    {
      name: 'habit-game-tasks',
    }
  )
);

