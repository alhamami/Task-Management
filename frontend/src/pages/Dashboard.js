import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const { user } = useAuth();
  const { tasks, loading, fetchTasks } = useTask();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length >= 0) {
      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      
      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks
      });
      
      // Get recent tasks (last 5, sorted by creation date)
      const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTasks(sortedTasks.slice(0, 5));
    }
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#ffc107';
      case 'pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCompletionPercentage = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName || user?.username}!</h1>
        <p className="dashboard-subtitle">Here's your task overview</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <div className="stat-number">{stats.totalTasks}</div>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <div className="stat-number" style={{ color: '#28a745' }}>
              {stats.completedTasks}
            </div>
            <div className="stat-percentage">
              {getCompletionPercentage()}% completion rate
            </div>
          </div>
        </div>
        
        <div className="stat-card in-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <div className="stat-number" style={{ color: '#ffc107' }}>
              {stats.inProgressTasks}
            </div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-number" style={{ color: '#dc3545' }}>
              {stats.pendingTasks}
            </div>
          </div>
        </div>
      </div>

      {stats.totalTasks > 0 && (
        <div className="progress-overview">
          <h3>Progress Overview</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${getCompletionPercentage()}%`,
                backgroundColor: '#28a745'
              }}
            ></div>
          </div>
          <p className="progress-text">
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </p>
        </div>
      )}
      
      <div className="recent-tasks">
        <div className="recent-tasks-header">
          <h2>Recent Tasks</h2>
          <Link to="/tasks" className="view-all-link">View All</Link>
        </div>
        
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No tasks yet.</p>
            <Link to="/tasks" className="btn btn-primary">Create your first task</Link>
          </div>
        ) : (
          <div className="task-list">
            {recentTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.description || 'No description'}</p>
                </div>
                <div className="task-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className="task-date">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.totalTasks > 0 && (
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/tasks" className="btn btn-primary">
              Manage Tasks
            </Link>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/tasks'}
            >
              Add New Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 