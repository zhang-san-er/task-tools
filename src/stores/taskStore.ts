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
  ensureAllTasksHaveOrder: () => void; // 确保所有任务都有序号
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData: TaskFormData) => {
        const state = get();
        let order = taskData.order;
        
        // 如果没有指定序号，自动分配一个（当前最大序号+1）
        if (order === undefined) {
          const maxOrder = state.tasks.reduce((max, task) => {
            return task.order !== undefined && task.order > max ? task.order : max;
          }, 0);
          order = maxOrder + 1;
        } else {
          // 如果指定了序号，需要调整其他任务的序号
          // 将所有序号 >= order 的任务序号+1
          set((currentState) => ({
            tasks: currentState.tasks.map((task) => {
              if (task.order !== undefined && task.order >= order!) {
                return { ...task, order: task.order + 1 };
              }
              return task;
            }),
          }));
        }
        
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
          order: order,
        };
        
        set((currentState) => ({
          tasks: [...currentState.tasks, newTask],
        }));
      },

      updateTask: (id: string, taskData: TaskFormData) => {
        set((state) => {
          const currentTask = state.tasks.find(task => task.id === id);
          if (!currentTask) return state;
          
          const oldOrder = currentTask.order;
          const newOrder = taskData.order;
          
          // 如果序号发生了变化，需要重新排序
          if (oldOrder !== newOrder && (oldOrder !== undefined || newOrder !== undefined)) {
            let updatedTasks = state.tasks.map((task) => {
              if (task.id === id) {
                // 先更新当前任务的其他字段，序号稍后处理
                return {
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
                  order: undefined, // 临时移除序号
                };
              }
              return task;
            });
            
            // 如果旧序号存在，先移除它（将大于旧序号的任务序号-1）
            if (oldOrder !== undefined) {
              updatedTasks = updatedTasks.map((task) => {
                if (task.id === id) {
                  return task; // 跳过当前任务
                }
                if (task.order !== undefined && task.order > oldOrder) {
                  return { ...task, order: task.order - 1 };
                }
                return task;
              });
            }
            
            // 如果新序号存在，插入到新位置（将大于等于新序号的任务序号+1）
            if (newOrder !== undefined) {
              updatedTasks = updatedTasks.map((task) => {
                if (task.id === id) {
                  return { ...task, order: newOrder };
                }
                if (task.order !== undefined && task.order >= newOrder) {
                  return { ...task, order: task.order + 1 };
                }
                return task;
              });
            }
            
            return { tasks: updatedTasks };
          } else {
            // 序号没有变化，直接更新其他字段
            return {
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
                      order: newOrder !== undefined ? newOrder : task.order,
                    }
                  : task
              ),
            };
          }
        });
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
        set((state) => {
          const taskToDelete = state.tasks.find(task => task.id === id);
          if (!taskToDelete) return state;
          
          const deletedOrder = taskToDelete.order;
          
          // 如果删除的任务有序号，需要调整其他任务的序号
          if (deletedOrder !== undefined) {
            return {
              tasks: state.tasks
                .filter((task) => task.id !== id)
                .map((task) => {
                  // 将所有序号 > deletedOrder 的任务序号-1
                  if (task.order !== undefined && task.order > deletedOrder) {
                    return { ...task, order: task.order - 1 };
                  }
                  return task;
                }),
            };
          }
          
          return {
            tasks: state.tasks.filter((task) => task.id !== id),
          };
        });
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

      ensureAllTasksHaveOrder: () => {
        set((state) => {
          const tasks = [...state.tasks];
          const tasksWithOrder = tasks.filter(task => task.order !== undefined);
          const tasksWithoutOrder = tasks.filter(task => task.order === undefined);
          
          // 如果所有任务都有序号，不需要处理
          if (tasksWithoutOrder.length === 0) {
            return state;
          }
          
          // 找出最大序号
          const maxOrder = tasksWithOrder.reduce((max, task) => {
            return task.order !== undefined && task.order > max ? task.order : max;
          }, 0);
          
          // 按照展示顺序排序没有序号的任务（与 TaskList 中的 sortTasks 逻辑一致）
          // 1. 未完成的任务排在前面
          // 2. 已完成的任务按完成时间升序排列（最早的在前）
          // 3. 如果都没有完成时间，按创建时间排序
          tasksWithoutOrder.sort((a, b) => {
            // 未完成的任务排在前面
            if (a.isCompleted !== b.isCompleted) {
              return a.isCompleted ? 1 : -1;
            }
            
            // 都已完成时，按完成时间升序排列
            if (a.isCompleted && b.isCompleted) {
              const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
              const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
              if (timeA !== 0 || timeB !== 0) {
                return timeA - timeB;
              }
            }
            
            // 如果都没有完成时间，按创建时间排序
            const createTimeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const createTimeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return createTimeA - createTimeB;
          });
          
          // 给没有序号的任务分配序号
          const updatedTasks = tasks.map((task) => {
            if (task.order === undefined) {
              const index = tasksWithoutOrder.findIndex(t => t.id === task.id);
              if (index !== -1) {
                return { ...task, order: maxOrder + index + 1 };
              }
            }
            return task;
          });
          
          return { tasks: updatedTasks };
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
              order: processedTask.order !== undefined ? processedTask.order : undefined,
            };
          });
        }
        return persistedState;
      },
    }
  )
);

