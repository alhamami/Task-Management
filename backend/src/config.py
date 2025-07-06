import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Example secret keys
    SECRET_KEY = os.getenv('SECRET_KEY', 'jalal')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'jalal')
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.getenv('DATABASE_PATH', 'task_management.db')}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

