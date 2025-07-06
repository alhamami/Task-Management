from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
from database import db
from config import Config

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config.from_object(Config)

# SQLite database configuration
database_path = os.getenv('DATABASE_PATH', 'task_management.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{database_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
cors = CORS(app)
migrate = Migrate(app, db)

# Import models
from models.user import User
from models.task import Task

# Import routes
from routes.auth import auth_bp
from routes.tasks import tasks_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')

# Test route
@app.route('/')
def home():
    return jsonify({'message': 'Task Management API is running!'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'success': False, 'message': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'success': False, 'message': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'success': False, 'message': 'No token provided, authorization denied'}), 401

if __name__ == '__main__':
    # Create database directory if it doesn't exist
    database_path = os.getenv('DATABASE_PATH', 'task_management.db')
    if '/' in database_path:
        db_dir = os.path.dirname(database_path)
        os.makedirs(db_dir, exist_ok=True)
    
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True) 
