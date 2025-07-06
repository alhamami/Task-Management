import React, { useState, useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';

const Tasks = () => {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTask();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }
      
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'medium'
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#ffc107';
      case 'pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Calculate quick stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">📋</div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      {/* Header Section */}
      <div className="tasks-page-header">
        <div className="header-content">
          <h1>📋 My Tasks</h1>
          <p className="header-subtitle">Organize and track your work efficiently</p>
        </div>
        <button 
          className="btn btn-primary btn-add-task"
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
            setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
          }}
        >
          <span>➕</span> Add New Task
        </button>
      </div>

      {/* Quick Stats */}
      <div className="tasks-quick-stats">
        <div className="quick-stat-item">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="quick-stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="quick-stat-item">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="quick-stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filter Section */}
      <div className="tasks-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-section">
          <span className="filter-icon">🏷️</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks ({stats.total})</option>
            <option value="pending">Pending ({stats.pending})</option>
            <option value="in-progress">In Progress ({stats.inProgress})</option>
            <option value="completed">Completed ({stats.completed})</option>
          </select>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="task-form-overlay">
          <div className="task-form-modal">
            <div className="modal-header">
              <h3>{editingTask ? '✏️ Edit Task' : '➕ Create New Task'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="title">📝 Task Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter task title..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">📄 Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Add task description (optional)..."
                  rows="4"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">📊 Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">🎯 Priority</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? '💾 Update Task' : '➕ Create Task'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="tasks-content">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-state">
            <div className="empty-icon">
              {searchTerm || filter !== 'all' ? '🔍' : '📝'}
            </div>
            <h3>
              {searchTerm || filter !== 'all' 
                ? 'No tasks match your criteria'
                : 'No tasks yet'
              }
            </h3>
            <p>
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter settings'
                : 'Create your first task to get started with organizing your work'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingTask(null);
                  setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
                }}
              >
                ➕ Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <div className="task-priority">
                    <span 
                      className="priority-badge"
                      style={{ color: getPriorityColor(task.priority) }}
                      title={`${task.priority || 'medium'} priority`}
                    >
                      {getPriorityIcon(task.priority)}
                    </span>
                  </div>
                  <div className="task-actions-menu">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(task)}
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="task-card-body">
                  <h3 className="task-title">{task.title}</h3>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                </div>
                
                <div className="task-card-footer">
                  <div className="task-status-section">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      <span className="status-icon">{getStatusIcon(task.status)}</span>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="task-meta">
                    <small className="task-date">
                      📅 {new Date(task.createdAt).toLocaleDateString()}
                    </small>
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                      <small className="task-date">
                        🔄 {new Date(task.updatedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks; 