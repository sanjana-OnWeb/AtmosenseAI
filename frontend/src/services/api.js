
const API_BASE_URL = "http://127.0.0.1:8001";

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error("Backend connection failed");
  return response.json();
}

export async function getReadings(limit = 100) {
  const response = await fetch(
    `${API_BASE_URL}/api/history/readings?limit=${limit}`
  );
  if (!response.ok) throw new Error("Unable to fetch sensor readings");
  return response.json();
}

export async function saveReading(reading) {
  const response = await fetch(`${API_BASE_URL}/api/history/readings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reading),
  });
  if (!response.ok) throw new Error("Unable to save sensor reading");
  return response.json();
}
export async function predictAnomaly(reading) {
  const response = await fetch(
    `${API_BASE_URL}/api/anomaly/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reading),
    }
  );

  if (!response.ok) {
    throw new Error("Anomaly detection failed");
  }

  return response.json();
}

export async function predictFault(reading) {
  const response = await fetch(
    `${API_BASE_URL}/api/classification/predict`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reading),
    }
  );

  if (!response.ok) {
    throw new Error("Fault classification failed");
  }

  return response.json();
}

export async function explainPrediction(reading) {
  const response = await fetch(
    `${API_BASE_URL}/api/explainability/explain`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reading),
    }
  );

  if (!response.ok) {
    throw new Error("Explainability analysis failed");
  }

  return response.json();
}
export async function assessSensorHealth(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/sensor-health/assess`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Sensor health assessment failed");
  }

  return response.json();
}
export async function uploadSensorCSV(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/data/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("CSV upload failed");
  }

  return response.json();
}
export async function preprocessSensorCSV(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/data/preprocess`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("CSV preprocessing failed");
  }

  return response.json();
}
export async function getAlerts() {
  const response = await fetch(`${API_BASE_URL}/api/alerts/`);

  if (!response.ok) {
    throw new Error("Unable to fetch alerts.");
  }

  return response.json();
}

export async function dismissAlert(alertId) {
  const response = await fetch(
    `${API_BASE_URL}/api/alerts/${alertId}/dismiss`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to dismiss alert.");
  }

  return response.json();
}
export async function createAlert(alert) {
  const response = await fetch(`${API_BASE_URL}/api/alerts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Unable to create alert.");
  }

  return response.json();
}