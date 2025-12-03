import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType, TaskFormData } from '../types/task';
import { isExpired } from '../utils/dateUtils';

interface TaskState {
  tasks: Task[];
  addTask: (taskData: TaskFormData) => void;
  toggleTaskCompletion: (id: string) => void;
  startTask: (id: string) => void; // 开始任务（支付入场费）
  cancelTask: (id: string) => void; // 取消任务（重置 isStarted）
  resetTask: (id: string) => void; // 重置任务（清除完成状态）
  claimTask: (id: string) => void; // 领取任务
  unclaimTask: (id: string) => void; // 取消领取任务
  deleteTask: (id: string) => void;
  getTasksByType: (type: TaskType) => Task[];
  getActiveTasks: () => Task[]; // 获取正在执行的任务（已领取但未完成）
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
          isClaimed: false,
          isRepeatable: taskData.isRepeatable !== undefined ? taskData.isRepeatable : true,
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

      cancelTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isStarted: false,
                }
              : task
          ),
        }));
      },

      resetTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isCompleted: false,
                  completedAt: undefined,
                  isStarted: false,
                }
              : task
          ),
        }));
      },

      claimTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isClaimed: true,
                }
              : task
          ),
        }));
      },

      unclaimTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  isClaimed: false,
                  isCompleted: false,
                  completedAt: undefined,
                  isStarted: false,
                }
              : task
          ),
        }));
      },
      
      toggleTaskCompletion: (id: string) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (!task) return state;

          const newIsCompleted = !task.isCompleted;
          
          // 如果任务完成且可重复，立即重置
          if (newIsCompleted && task.isRepeatable) {
            return {
              tasks: state.tasks.map((t) =>
                t.id === id
                  ? {
                      ...t,
                      isCompleted: false,
                      completedAt: undefined,
                      isStarted: false,
                    }
                  : t
              ),
            };
          }

          // 否则正常切换完成状态
          return {
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    isCompleted: newIsCompleted,
                    completedAt: newIsCompleted ? new Date() : undefined,
                  }
                : t
            ),
          };
        });
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
      
      getActiveTasks: () => {
        return get().tasks.filter((task) => 
          task.isClaimed === true && task.isCompleted === false
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
      migrate: (persistedState: any) => {
        // 迁移函数：确保所有任务都有 isRepeatable 和 isClaimed 字段
        if (persistedState && persistedState.tasks) {
          persistedState.tasks = persistedState.tasks.map((task: Task) => ({
            ...task,
            isRepeatable: task.isRepeatable !== undefined ? task.isRepeatable : true,
            isClaimed: task.isClaimed !== undefined ? task.isClaimed : false,
          }));
        }
        return persistedState;
      },
    }
  )
);

