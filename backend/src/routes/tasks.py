from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from sqlalchemy import or_, func
from datetime import datetime
from models.task import Task
from models.user import User
from database import db

tasks_bp = Blueprint('tasks', __name__)

# Validation schemas
class TaskSchema(Schema):
    title = fields.Str(required=True, validate=lambda x: len(x) >= 1 and len(x) <= 200)
    description = fields.Str(allow_none=True, validate=lambda x: len(x) <= 1000 if x else True)
    priority = fields.Str(validate=lambda x: x in ['low', 'medium', 'high'], missing='medium')
    status = fields.Str(validate=lambda x: x in ['pending', 'in-progress', 'completed'], missing='pending')
    due_date = fields.DateTime(allow_none=True, format='iso')

class TaskUpdateSchema(Schema):
    title = fields.Str(validate=lambda x: len(x) >= 1 and len(x) <= 200, missing=None)
    description = fields.Str(allow_none=True, validate=lambda x: len(x) <= 1000 if x else True, missing=None)
    priority = fields.Str(validate=lambda x: x in ['low', 'medium', 'high'], missing=None)
    status = fields.Str(validate=lambda x: x in ['pending', 'in-progress', 'completed'], missing=None)
    due_date = fields.DateTime(allow_none=True, format='iso', missing=None)

@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        status = request.args.get('status')
        priority = request.args.get('priority')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Build query
        query = Task.query.filter_by(user_id=current_user_id)
        
        # Apply filters
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if search:
            query = query.filter(
                or_(
                    Task.title.ilike(f'%{search}%'),
                    Task.description.ilike(f'%{search}%')
                )
            )
        
        # Apply pagination
        offset = (page - 1) * limit
        total = query.count()
        tasks = query.order_by(Task.created_at.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': {
                'tasks': [task.to_dict() for task in tasks],
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'totalPages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error while fetching tasks'
        }), 500

@tasks_bp.route('/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        current_user_id = get_jwt_identity()
        
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({
                'success': False,
                'message': 'Task not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'task': task.to_dict()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error while fetching task'
        }), 500

@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    try:
        current_user_id = get_jwt_identity()
        
        # Validate request data
        schema = TaskSchema()
        data = schema.load(request.json)
        
        # Validate due date is not in the past
        if data.get('due_date') and data['due_date'] < datetime.utcnow():
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': [{'field': 'due_date', 'message': 'Due date cannot be in the past'}]
            }), 400
        
        # Create new task
        task = Task(
            title=data['title'],
            user_id=current_user_id,
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'pending'),
            due_date=data.get('due_date')
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Task created successfully',
            'data': {
                'task': task.to_dict()
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation failed',
            'errors': [{'field': field, 'message': errors} for field, errors in e.messages.items()]
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Server error while creating task'
        }), 500

@tasks_bp.route('/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Find task
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({
                'success': False,
                'message': 'Task not found'
            }), 404
        
        # Validate request data
        schema = TaskUpdateSchema()
        data = schema.load(request.json)
        
        # Update task fields
        if data.get('title') is not None:
            task.title = data['title']
        if data.get('description') is not None:
            task.description = data['description']
        if data.get('priority') is not None:
            task.priority = data['priority']
        if data.get('status') is not None:
            task.update_status(data['status'])
        if data.get('due_date') is not None:
            task.due_date = data['due_date']
        
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Task updated successfully',
            'data': {
                'task': task.to_dict()
            }
        })
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation failed',
            'errors': [{'field': field, 'message': errors} for field, errors in e.messages.items()]
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Server error while updating task'
        }), 500

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Find task
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({
                'success': False,
                'message': 'Task not found'
            }), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Task deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Server error while deleting task'
        }), 500

@tasks_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_task_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # Get task counts by status
        stats = db.session.query(
            Task.status,
            func.count(Task.id).label('count')
        ).filter_by(user_id=current_user_id).group_by(Task.status).all()
        
        # Format stats
        formatted_stats = {
            'pending': 0,
            'in-progress': 0,
            'completed': 0
        }
        
        for stat in stats:
            formatted_stats[stat.status] = stat.count
        
        return jsonify({
            'success': True,
            'data': {
                'stats': formatted_stats
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error while fetching task statistics'
        }), 500 