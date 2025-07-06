from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError, validate
from email_validator import validate_email, EmailNotValidError
import re
from models.user import User
from database import db

auth_bp = Blueprint('auth', __name__)

# Validation schemas
class RegisterSchema(Schema):
    # Username must be between 3 and 30 characters
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=30),
        error_messages={"required": "Username is required."}
    )
    
    # Email must be a valid email format
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required."}
    )
    
    # Password must be at least 6 characters
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        error_messages={"required": "Password is required."}
    )
    
    # First name must be between 1 and 50 characters
    first_name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={"required": "First name is required."}
    )
    
    # Last name must be between 1 and 50 characters
    last_name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={"required": "Last name is required."}
    )

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

# validate password strength
def validate_password_strength(password):
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, ""

# validate username format
def validate_username_format(username):
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, ""

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Validate request data
        schema = RegisterSchema()
        data = schema.load(request.json)
        
        # Additional validations
        is_valid_password, password_error = validate_password_strength(data['password'])
        if not is_valid_password:
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': [{'field': 'password', 'message': password_error}]
            }), 400
        
        is_valid_username, username_error = validate_username_format(data['username'])
        if not is_valid_username:
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': [{'field': 'username', 'message': username_error}]
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.email == data['email']) | (User.username == data['username'])
        ).first()
        
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'User with this email or username already exists'
            }), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'token': access_token,
                'user': user.to_dict()
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
            'message': 'Server error during registration'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Validate request data
        schema = LoginSchema()
        data = schema.load(request.json)
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 400
        
        # Check password
        if not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 400
        
        # Check if user is active
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is deactivated'
            }), 400
        
        # Generate token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'token': access_token,
                'user': user.to_dict()
            }
        })
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation failed',
            'errors': [{'field': field, 'message': errors} for field, errors in e.messages.items()]
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error during login'
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error'
        }), 500 