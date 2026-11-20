
import numpy as np
import pandas as pd

np.random.seed(42)

# Generate 1000 hourly sensor records
rows = 1000

timestamps = pd.date_range(
    start="2026-01-01",
    periods=rows,
    freq="h"
)

temperature = np.random.normal(28, 3, rows)
humidity = np.random.normal(65, 10, rows)
pressure = np.random.normal(1010, 5, rows)
wind_speed = np.random.normal(4, 1.5, rows)

humidity = np.clip(humidity, 30, 95)
pressure = np.clip(pressure, 990, 1030)
wind_speed = np.clip(wind_speed, 0, 12)

df = pd.DataFrame({
    "timestamp": timestamps,
    "station_id": "CHN-01",
    "temperature_c": temperature,
    "humidity_pct": humidity,
    "pressure_hpa": pressure,
    "wind_speed_ms": wind_speed
})

# Initialize ground-truth labels
df["is_injected_anomaly"] = 0
df["injected_fault_type"] = "normal"

# Select 50 unique records for injected anomalies
anomaly_indices = np.random.choice(rows, 50, replace=False)

# Temperature spikes
spike_indices = anomaly_indices[:15]
df.loc[spike_indices, "temperature_c"] = np.random.uniform(
    45, 60, len(spike_indices)
)
df.loc[spike_indices, "injected_fault_type"] = "temperature_spike"

# Frozen temperature sensor
frozen_indices = anomaly_indices[15:25]
df.loc[frozen_indices, "temperature_c"] = 25.0
df.loc[frozen_indices, "injected_fault_type"] = "frozen_sensor"

# Abnormal humidity
humidity_indices = anomaly_indices[25:35]
df.loc[humidity_indices, "humidity_pct"] = np.random.uniform(
    0, 10, len(humidity_indices)
)
df.loc[humidity_indices, "injected_fault_type"] = "humidity_anomaly"

# Abnormal pressure
pressure_indices = anomaly_indices[35:45]
df.loc[pressure_indices, "pressure_hpa"] = np.random.uniform(
    1040, 1060, len(pressure_indices)
)
df.loc[pressure_indices, "injected_fault_type"] = "pressure_anomaly"

# Extreme wind readings
wind_indices = anomaly_indices[45:50]
df.loc[wind_indices, "wind_speed_ms"] = np.random.uniform(
    20, 30, len(wind_indices)
)
df.loc[wind_indices, "injected_fault_type"] = "wind_anomaly"

# Mark injected anomaly records
df.loc[anomaly_indices, "is_injected_anomaly"] = 1

# Save dataset
output_path = "ml/datasets/atmospheric_sensor_data.csv"
df.to_csv(output_path, index=False)

print("Dataset generated successfully!")
print("Total records:", len(df))
print("Injected anomaly records:", df["is_injected_anomaly"].sum())
print("\nFault distribution:")
print(df["injected_fault_type"].value_counts())
print("\nSaved to:", output_path)
