
import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# Project paths
ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "ml" / "datasets" / "atmospheric_sensor_data.csv"
MODEL_PATH = ROOT / "ml" / "classification" / "random_forest_classifier.joblib"

# Load dataset
df = pd.read_csv(DATA_PATH)

# Sensor features
features = [
    "temperature_c",
    "humidity_pct",
    "pressure_hpa",
    "wind_speed_ms"
]

target = "injected_fault_type"

X = df[features]
y = df[target]

# Split dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Create Random Forest classifier
model = RandomForestClassifier(
    n_estimators=300,
    class_weight="balanced_subsample",
    random_state=42,
    n_jobs=-1
)

# Train model
print("Training Random Forest classifier...")
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Evaluation
print("\n========== CLASSIFICATION RESULTS ==========")
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print("Fault categories:", list(model.classes_))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred, labels=model.classes_))

print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

print("Accuracy:", round(accuracy_score(y_test, y_pred) * 100, 2), "%")

# Save model
joblib.dump(model, MODEL_PATH)

print("\nClassifier saved successfully!")
print("Location:", MODEL_PATH)
