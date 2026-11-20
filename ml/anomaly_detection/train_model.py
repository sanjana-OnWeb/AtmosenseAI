
import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

# Project paths
ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "ml" / "datasets" / "atmospheric_sensor_data.csv"
MODEL_PATH = ROOT / "ml" / "anomaly_detection" / "isolation_forest_model.joblib"

# Load dataset
df = pd.read_csv(DATA_PATH)

features = [
    "temperature_c",
    "humidity_pct",
    "pressure_hpa",
    "wind_speed_ms"
]

X = df[features]
y_true = df["is_injected_anomaly"].astype(int)

# Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_true,
    test_size=0.20,
    random_state=42,
    stratify=y_true
)

# Create Isolation Forest pipeline
model = Pipeline([
    ("scaler", StandardScaler()),
    ("isolation_forest", IsolationForest(
        n_estimators=300,
        contamination=0.05,
        random_state=42
    ))
])

# Train without using anomaly labels
print("Training Isolation Forest...")
model.fit(X_train)

# Predict on unseen test data
raw_predictions = model.predict(X_test)

# Convert -1 (anomaly) to 1 and 1 (normal) to 0
y_pred = (raw_predictions == -1).astype(int)

# Evaluate
print("\n========== ISOLATION FOREST EVALUATION ==========")
print("Total records:", len(df))
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print("Actual anomalies in test:", int(y_test.sum()))
print("Predicted anomalies:", int(y_pred.sum()))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred, labels=[0, 1]))

print("\nClassification Report:")
print(classification_report(
    y_test,
    y_pred,
    labels=[0, 1],
    target_names=["Normal", "Anomaly"],
    zero_division=0
))

print("Accuracy:", round(accuracy_score(y_test, y_pred) * 100, 2), "%")
print("Precision:", round(precision_score(y_test, y_pred, zero_division=0), 4))
print("Recall:", round(recall_score(y_test, y_pred, zero_division=0), 4))
print("F1-score:", round(f1_score(y_test, y_pred, zero_division=0), 4))

# Retrain final model using the complete dataset
print("\nTraining final model on the complete dataset...")
model.fit(X)

# Save final model
joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully!")
print("Location:", MODEL_PATH)
