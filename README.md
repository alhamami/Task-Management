# Project Overview

This project is a full-stack application consisting of a frontend built with React and a backend built with Flask. The application provides a task management system with user authentication and task handling features.

## Features

- User registration and authentication
- Task creation, updating, and deletion
- Responsive user interface
- RESTful API

## Prerequisites

- Docker and Docker Compose installed on your machine

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Build and Run the Application**
   Use Docker Compose to build and run the application:
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Project Structure

- **frontend/**: Contains the React frontend application.
- **backend/**: Contains the Flask backend application.
- **docker-compose.yml**: Configuration file for Docker Compose to manage multi-container applications.

## Configuration

- Environment variables can be set in a `.env` file in the root directory.
- Configuration settings are centralized in `backend/src/config.py`.

## Development

- To run the frontend and backend separately for development, use the respective Dockerfiles in the `frontend` and `backend` directories.

## How to Run

To run the application, follow these steps:

1. **Ensure Docker and Docker Compose are installed** on your machine.

2. **Navigate to the project directory**:
   ```bash
   cd <repository-directory>
   ```

3. **Build and start the application** using Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: Open your browser and go to `http://localhost:3000`
   - Backend API: Access the API at `http://localhost:5000`

5. **Stop the application**:
   To stop the application, press `Ctrl+C` in the terminal where Docker Compose is running.

6. **Remove containers**:
   To remove the containers, run:
   ```bash
   docker-compose down
   ```

## License

This project is licensed under the MIT License.

## Running Without Docker

To run the application without Docker, follow these steps:

### Backend

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**:
   ```bash
   python src/app.py
   ```

### Frontend

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Run the frontend server**:
   ```bash
   npm start
   ```

### Access the Application

- Frontend: Open your browser and go to `http://localhost:3000`
- Backend API: Access the API at `http://localhost:5000` 