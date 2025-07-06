import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: false,
    error: null
  });

  const fetchTasks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('/api/tasks/', { headers });
      dispatch({ type: 'SET_TASKS', payload: response.data.data?.tasks || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch tasks' });
    }
  };

  const createTask = async (taskData) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post('/api/tasks/', taskData, { headers });
      dispatch({ type: 'ADD_TASK', payload: response.data.data.task });
      return response.data.data.task;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to create task' });
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`/api/tasks/${taskId}`, taskData, { headers });
      dispatch({ type: 'UPDATE_TASK', payload: response.data.data.task });
      return response.data.data.task;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update task' });
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`/api/tasks/${taskId}`, { headers });
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete task' });
      throw error;
    }
  };

  const value = {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 