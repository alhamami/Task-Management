FROM node:18-alpine as frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

RUN npm run build

FROM python:3.11-slim as backend

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

COPY --from=frontend /app/frontend/build /app/backend/static

RUN addgroup --system --gid 1001 appuser
RUN adduser --system --uid 1001 --gid 1001 appuser

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

CMD ["python", "src/app.py"] 