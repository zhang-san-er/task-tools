import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType, TaskFormData } from '../types/task';
import { isExpired } from '../utils/dateUtils';

interface TaskState {
  tasks: Task[];
  addTask: (taskData: TaskFormData) => void;
  updateTask: (id: string, taskData: TaskFormData) => void;
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
          isAvoidanceTask: taskData.isAvoidanceTask || false,
          createdAt: new Date(),
          expiresAt: taskData.expiresAt,
          durationDays: taskData.durationDays,
          dailyLimit: taskData.dailyLimit !== undefined ? taskData.dailyLimit : 1,
          exceedDaysRewardFormula: taskData.exceedDaysRewardFormula,
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id: string, taskData: TaskFormData) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  name: taskData.name,
                  type: taskData.type,
                  points: taskData.points,
                  entryCost: taskData.type === 'demon' ? (taskData.entryCost || 0) : undefined,
                  isRepeatable: taskData.isRepeatable !== undefined ? taskData.isRepeatable : true,
                  isAvoidanceTask: taskData.isAvoidanceTask || false,
                  expiresAt: taskData.expiresAt,
                  durationDays: taskData.durationDays,
                  dailyLimit: taskData.dailyLimit !== undefined ? taskData.dailyLimit : 1,
                  exceedDaysRewardFormula: taskData.exceedDaysRewardFormula,
                }
              : task
          ),
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
        set((state) => {
          return {
            tasks: state.tasks.map((task) => {
              if (task.id === id) {
                // 如果有持续天数且还没有expiresAt，计算截止日期
                let expiresAt = task.expiresAt;
                if (task.durationDays && !expiresAt) {
                  const claimDate = new Date();
                  claimDate.setDate(claimDate.getDate() + task.durationDays);
                  claimDate.setHours(23, 59, 59, 999);
                  expiresAt = claimDate;
                }
                return {
                  ...task,
                  isClaimed: true,
                  expiresAt: expiresAt,
                  claimedAt: new Date(), // 记录领取时间（每次领取都更新）
                };
              }
              return task;
            }),
          };
        });
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
                  // 注意：不清除 claimedAt，因为需要用它来计算超越天数奖励
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
        // 迁移函数：确保所有任务都有必需的字段，兼容历史数据
        if (persistedState && persistedState.tasks) {
          persistedState.tasks = persistedState.tasks.map((task: any) => {
            // 处理日期字段的序列化/反序列化
            const processedTask: any = {
              ...task,
              createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
              expiresAt: task.expiresAt ? new Date(task.expiresAt) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            };

            // 确保所有必需字段都有默认值
            return {
              ...processedTask,
              isRepeatable: processedTask.isRepeatable !== undefined ? processedTask.isRepeatable : true,
              isAvoidanceTask: processedTask.isAvoidanceTask !== undefined ? processedTask.isAvoidanceTask : false,
              isClaimed: processedTask.isClaimed !== undefined ? processedTask.isClaimed : false,
              isStarted: processedTask.isStarted !== undefined ? processedTask.isStarted : false,
              isCompleted: processedTask.isCompleted !== undefined ? processedTask.isCompleted : false,
              entryCost: processedTask.type === 'demon' ? (processedTask.entryCost || 0) : undefined,
              durationDays: processedTask.durationDays !== undefined ? processedTask.durationDays : undefined,
              dailyLimit: processedTask.dailyLimit !== undefined ? processedTask.dailyLimit : 1,
              exceedDaysRewardFormula: processedTask.exceedDaysRewardFormula !== undefined ? processedTask.exceedDaysRewardFormula : undefined,
              claimedAt: processedTask.claimedAt ? new Date(processedTask.claimedAt) : undefined,
            };
          });
        }
        return persistedState;
      },
    }
  )
);

