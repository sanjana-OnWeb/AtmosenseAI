# Atmosense AI
### Intelligent Atmospheric Sensor Anomaly Detection System

## 1. Project Overview

Atmosense AI is an AI-powered atmospheric sensor monitoring and anomaly detection system designed to monitor environmental sensor readings, identify unusual patterns, classify possible sensor faults, and provide alerts.

The platform combines machine learning, data preprocessing, explainable AI, and an interactive web dashboard to support atmospheric sensor monitoring.

## 2. Key Features

- **Dashboard:** Overview of atmospheric sensor monitoring and alerts.
- **Sensor Monitoring:** Record and manage sensor readings.
- **AI Anomaly Detection:** Identify unusual sensor patterns using Isolation Forest.
- **Fault Classification:** Classify possible sensor faults using Random Forest.
- **Explainable AI:** Generate explanations for model predictions using SHAP.
- **Sensor Health Assessment:** Evaluate sensor health.
- **CSV Data Management:** Upload, inspect, and preprocess sensor datasets.
- **Alerts & Notifications:** Generate, monitor, refresh, and dismiss alerts.

## 3. Technologies Used

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript
- Lucide React

### Backend
- Python
- FastAPI
- Pydantic
- Pandas

### Machine Learning
- Scikit-learn
- Isolation Forest
- Random Forest
- SHAP
- Joblib

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Swagger UI

## 4. Machine Learning Models

### Isolation Forest
Used for detecting unusual atmospheric sensor readings.

Input features:
- Temperature (°C)
- Humidity (%)
- Pressure (hPa)
- Wind Speed (m/s)

### Random Forest Classifier
Used for identifying possible sensor fault categories.

Fault categories:
- Normal
- Frozen Sensor
- Humidity Anomaly
- Pressure Anomaly
- Temperature Spike
- Wind Anomaly

## 5. Model Performance

Models were evaluated using an 80:20 training and testing split.

| Metric | Isolation Forest | Random Forest |
|---|---:|---:|
| Accuracy | 98.00% | 99.50% |
| Precision | 87.50% | 100%* |
| Recall | 70.00% | 92%* |
| F1-score | 77.78% | 94%* |

*Random Forest precision, recall, and F1-score are rounded macro averages from the classification report. The dataset is imbalanced, so accuracy should be interpreted alongside class-level metrics.*

## 6. CSV Data Preprocessing

The system supports:
- CSV file upload and inspection.
- Column and data type identification.
- Missing value detection.
- Duplicate row detection and removal.
- Missing numerical value replacement using median imputation.
- Processed data preview.

## 7. Project Structure

```text
AtmosenseAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── sample_sensor_data.csv
├── documentation/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── ml/
│   ├── anomaly_detection/
│   ├── classification/
│   ├── datasets/
│   ├── explainability/
│   ├── preprocessing/
│   └── sensor_health/
├── .gitignore
└── README.md
```

## 8. Running the Project Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend API: `http://127.0.0.1:8000`

Swagger documentation: `http://127.0.0.1:8000/docs`

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed by Vite.

## 9. Repository

GitHub: https://github.com/sanjana-OnWeb/AtmosenseAI

## 10. Project Purpose

Atmosense AI demonstrates the application of machine learning, environmental sensor data processing, anomaly detection, and web technologies in an integrated monitoring platform.