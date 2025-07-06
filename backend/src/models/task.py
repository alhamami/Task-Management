from datetime import datetime
import uuid
from database import db

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(10), default='medium', nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    def __init__(self, title, user_id, description=None, priority='medium', 
                 status='pending', due_date=None):
        self.title = title
        self.user_id = user_id
        self.description = description
        self.priority = priority
        self.status = status
        self.due_date = due_date
    
    # update task status
    def update_status(self, new_status):
        self.status = new_status
        if new_status == 'completed':
            self.completed_at = datetime.utcnow()
        elif self.completed_at and new_status != 'completed':
            self.completed_at = None
    
    # convert task to dictionary
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'dueDate': self.due_date.isoformat() if self.due_date else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
            'userId': self.user_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Task {self.title}>' 