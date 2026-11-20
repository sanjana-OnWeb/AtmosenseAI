import { useEffect, useState } from "react";
import {
  getHealth,
  getReadings,
  saveReading,
  predictAnomaly,
  predictFault,
  explainPrediction,
  assessSensorHealth,
  uploadSensorCSV,
  preprocessSensorCSV,
  getAlerts,
  dismissAlert,
  createAlert
} from "./services/api";

import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  Cloud,
  CloudRain,
  Gauge,
  LayoutDashboard,
  MapPin,
  Menu,
  Radio,
  ShieldCheck,
  Thermometer,
  Wind,
  X,
  Droplets,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CircleHelp,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Sensor Monitoring', icon: Radio },
  { name: 'Anomaly Detection', icon: AlertTriangle },
  { name: 'Fault Classification', icon: Activity },
  { name: 'Explainable AI', icon: Activity },
  { name: 'Sensor Health', icon: ShieldCheck },
  { name: 'Data Management', icon: Activity },
  { name: 'Alerts & Notifications', icon: Bell },
];

const metrics = [
  {
    title: 'Temperature',
    value: '28.6',
    unit: '°C',
    change: '+1.2%',
    positive: true,
    icon: Thermometer,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    title: 'Humidity',
    value: '74.2',
    unit: '%',
    change: '-2.4%',
    positive: false,
    icon: Droplets,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    title: 'Air Pressure',
    value: '1013',
    unit: 'hPa',
    change: '+0.8%',
    positive: true,
    icon: Gauge,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    title: 'Wind Speed',
    value: '16.8',
    unit: 'km/h',
    change: '+0.5%',
    positive: true,
    icon: Wind,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
]

const anomalies = [
  {
    station: 'Station Alpha',
    parameter: 'Temperature',
    issue: 'Sudden spike',
    severity: 'High',
    time: '10:42 AM',
  },
  {
    station: 'Station Beta',
    parameter: 'Humidity',
    issue: 'Sensor drift',
    severity: 'Medium',
    time: '10:18 AM',
  },
  {
    station: 'Station Gamma',
    parameter: 'Air Pressure',
    issue: 'Missing values',
    severity: 'Low',
    time: '09:56 AM',
  },
]

const stations = [
  { name: 'Station Alpha', location: 'Chennai Central', health: 96, status: 'Healthy' },
  { name: 'Station Beta', location: 'Tambaram', health: 72, status: 'Warning' },
  { name: 'Station Gamma', location: 'Avadi', health: 89, status: 'Healthy' },
]

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
const [readings, setReadings] = useState([]);
const [formData, setFormData] = useState({
  station_id: "CHN-01",
  temperature_c: "",
  humidity_pct: "",
  pressure_hpa: "",
  wind_speed_ms: "",
});

// Alerts & Notifications States
const [alerts, setAlerts] = useState([]);
const [alertsLoading, setAlertsLoading] = useState(false);
const [alertsError, setAlertsError] = useState("");
const [alertsRefreshMessage, setAlertsRefreshMessage] = useState("");
const [dismissingAlert, setDismissingAlert] = useState(null);
const [showNotifications, setShowNotifications] = useState(false);

const [saveMessage, setSaveMessage] = useState("");
const [saving, setSaving] = useState(false);
const [loading, setLoading] = useState(true);

const [anomalyData, setAnomalyData] = useState({
  temperature_c: "28.5",
  humidity_pct: "65",
  pressure_hpa: "1010",
  wind_speed_ms: "4.2",
});

const [anomalyResult, setAnomalyResult] = useState(null);
const [anomalyLoading, setAnomalyLoading] = useState(false);
const [anomalyError, setAnomalyError] = useState("");
const [classificationData, setClassificationData] = useState({
  temperature_c: "28.5",
  humidity_pct: "65",
  pressure_hpa: "1010",
  wind_speed_ms: "4.2",
});

const [classificationResult, setClassificationResult] = useState(null);
const [classificationLoading, setClassificationLoading] = useState(false);
const [classificationError, setClassificationError] = useState("");
const [explainData, setExplainData] = useState({
  temperature_c: "0",
  humidity_pct: "0",
  pressure_hpa: "0",
  wind_speed_ms: "0",
});
const [healthStationId, setHealthStationId] = useState("CHN-01");

const [healthReadings, setHealthReadings] = useState(
  JSON.stringify(
    [
      {
        temperature_c: 28.5,
        humidity_pct: 65,
        pressure_hpa: 1010,
        wind_speed_ms: 4.2,
      },
      {
        temperature_c: 28.5,
        humidity_pct: 65,
        pressure_hpa: 1010,
        wind_speed_ms: 4.2,
      },
      {
        temperature_c: 29,
        humidity_pct: 68,
        pressure_hpa: 1008,
        wind_speed_ms: 5,
      },
    ],
    null,
    2
  )
);

const [healthResult, setHealthResult] = useState(null);
const [healthLoading, setHealthLoading] = useState(false);
const [healthError, setHealthError] = useState("");

const [explainResult, setExplainResult] = useState(null);
const [explainLoading, setExplainLoading] = useState(false);
const [explainError, setExplainError] = useState("");

// CSV Upload States
const [csvFile, setCsvFile] = useState(null);
const [csvResult, setCsvResult] = useState(null);
const [csvLoading, setCsvLoading] = useState(false);
const [csvError, setCsvError] = useState("");

// CSV Preprocessing States
const [preprocessResult, setPreprocessResult] = useState(null);
const [preprocessLoading, setPreprocessLoading] = useState(false);
const [preprocessError, setPreprocessError] = useState("");

async function handleSensorHealth(event) {
  event.preventDefault();

  setHealthLoading(true);
  setHealthError("");
  setHealthResult(null);

  try {
    const stationReadings = readings
      .filter(
        (reading) =>
          String(reading.station_id).trim() === healthStationId.trim()
      )
      .map((reading) => ({
        temperature_c: reading.temperature_c,
        humidity_pct: reading.humidity_pct,
        pressure_hpa: reading.pressure_hpa,
        wind_speed_ms: reading.wind_speed_ms,
      }));

    if (stationReadings.length === 0) {
      throw new Error(
        "No saved readings found for this station. Save sensor readings first."
      );
    }

    const result = await assessSensorHealth({
      station_id: healthStationId,
      readings: stationReadings,
    });

    setHealthResult(result);
  } catch (error) {
    setHealthError(
      error.message || "Unable to assess sensor health."
    );
  } finally {
    setHealthLoading(false);
  }
}
async function handleCSVUpload(event) {
  event.preventDefault();

  if (!csvFile) {
    setCsvError("Please select a CSV file first.");
    return;
  }

  setCsvLoading(true);
  setCsvError("");
  setCsvResult(null);
  setPreprocessResult(null);
  setPreprocessError("");

  try {
    const result = await uploadSensorCSV(csvFile);
    setCsvResult(result);
  } catch (error) {
    setCsvError(error.message || "Unable to upload CSV file.");
  } finally {
    setCsvLoading(false);
  }
}

async function handleCSVPreprocessing() {
  if (!csvFile) {
    setPreprocessError("Please select a CSV file first.");
    return;
  }

  setPreprocessLoading(true);
  setPreprocessError("");
  setPreprocessResult(null);

  try {
    const result = await preprocessSensorCSV(csvFile);
    setPreprocessResult(result);
  } catch (error) {
    setPreprocessError(
      error.message || "Unable to preprocess CSV."
    );
  } finally {
    setPreprocessLoading(false);
  }
}
useEffect(() => {
  async function loadDashboard() {
    try {
      const health = await getHealth();
      setBackendStatus(health.status);

      const data = await getReadings();
      setReadings(data);
    } catch (error) {
      setBackendStatus("Disconnected");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  loadDashboard();
}, []);
async function handleAnomalyDetection(event) {
  event.preventDefault();

  setAnomalyLoading(true);
  setAnomalyResult(null);
  setAnomalyError("");

  try {
    const result = await predictAnomaly({
      temperature_c: Number(anomalyData.temperature_c),
      humidity_pct: Number(anomalyData.humidity_pct),
      pressure_hpa: Number(anomalyData.pressure_hpa),
      wind_speed_ms: Number(anomalyData.wind_speed_ms),
    });

    setAnomalyResult(result);

    if (result.is_anomaly) {
      try {
        await createAlert({
          station_id: readings[0]?.station_id || "CHN-01",
          alert_type: "Atmospheric Anomaly",
          severity: "Warning",
          message: `Anomaly detected. Temperature: ${anomalyData.temperature_c} °C, Humidity: ${anomalyData.humidity_pct}%, Pressure: ${anomalyData.pressure_hpa} hPa, Wind Speed: ${anomalyData.wind_speed_ms} m/s.`,
        });

        await loadAlerts();
      } catch (alertError) {
        setAnomalyError(
          "Anomaly detected, but the alert could not be saved."
        );
        console.error(alertError);
      }
    }
  } catch (error) {
    console.error(error);
    setAnomalyError(
      "Unable to perform anomaly detection. Check backend connection."
    );
  } finally {
    setAnomalyLoading(false);
  }
}

async function handleFaultClassification(event) {
  event.preventDefault();

  setClassificationLoading(true);
  setClassificationResult(null);
  setClassificationError("");

  try {
    const result = await predictFault({
      temperature_c: Number(classificationData.temperature_c),
      humidity_pct: Number(classificationData.humidity_pct),
      pressure_hpa: Number(classificationData.pressure_hpa),
      wind_speed_ms: Number(classificationData.wind_speed_ms),
    });

    setClassificationResult(result);

    const faultType = String(
      result.predicted_fault_type || ""
    ).toLowerCase().replace(/_/g, " ").trim();

    const hasFault = ![
      "normal",
      "no fault",
      "healthy",
      "none",
    ].includes(faultType);

    if (hasFault && faultType) {
      try {
        await createAlert({
          station_id: readings[0]?.station_id || "CHN-01",
          alert_type: "Sensor Fault",
          severity: "Warning",
          message: `Sensor fault detected: ${result.predicted_fault_type.replace(/_/g, " ")}. Model confidence: ${(result.confidence * 100).toFixed(2)}%.`,
        });

        await loadAlerts();
      } catch (alertError) {
        setClassificationError(
          "Fault detected, but the alert could not be saved."
        );
        console.error(alertError);
      }
    }
  } catch (error) {
    console.error(error);
    setClassificationError(
      "Unable to classify sensor fault. Check backend connection."
    );
  } finally {
    setClassificationLoading(false);
  }
}

async function handleExplainability(event) {
  event.preventDefault();

  setExplainLoading(true);
  setExplainResult(null);
  setExplainError("");

  try {
    const result = await explainPrediction({
      temperature_c: Number(explainData.temperature_c),
      humidity_pct: Number(explainData.humidity_pct),
      pressure_hpa: Number(explainData.pressure_hpa),
      wind_speed_ms: Number(explainData.wind_speed_ms),
    });

    setExplainResult(result);
  } catch (error) {
    console.error(error);
    setExplainError(
      "Unable to generate feature explanations. Check backend connection."
    );
  } finally {
    setExplainLoading(false);
  }
}
async function handleSaveReading(event) {
  event.preventDefault();
  setSaving(true);
  setSaveMessage("");

  try {
    await saveReading({
      station_id: formData.station_id.trim(),
      temperature_c: Number(formData.temperature_c),
      humidity_pct: Number(formData.humidity_pct),
      pressure_hpa: Number(formData.pressure_hpa),
      wind_speed_ms: Number(formData.wind_speed_ms),
    });

    const updatedReadings = await getReadings();
    setReadings(updatedReadings);
    setSaveMessage("Sensor reading saved successfully!");

    setFormData({
      station_id: "CHN-01",
      temperature_c: "",
      humidity_pct: "",
      pressure_hpa: "",
      wind_speed_ms: "",
    });
  } catch (error) {
    setSaveMessage(error.message || "Failed to save reading. Please try again.");
    console.error("Save reading error:", error);
  } finally {
    setSaving(false);
  }
}
async function loadAlerts() {
  setAlertsLoading(true);
  setAlertsError("");
  setAlertsRefreshMessage("Refreshing alerts...");

  try {
    const data = await getAlerts();
    setAlerts(data);
    setAlertsRefreshMessage("Alerts refreshed successfully.");
  } catch (error) {
    setAlertsError(error.message || "Unable to load alerts.");
    setAlertsRefreshMessage("");
  } finally {
    setAlertsLoading(false);
  }
}
async function handleDismissAlert(alertId) {
  setDismissingAlert(alertId);
  setAlertsError("");

  try {
    await dismissAlert(alertId);
    await loadAlerts();
  } catch (error) {
    setAlertsError(error.message || "Unable to dismiss alert.");
  } finally {
    setDismissingAlert(null);
  }
}

  const [activePage, setActivePage] = useState('Dashboard')
  const [period, setPeriod] = useState('24 Hours')
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
  if (activePage === "Alerts & Notifications") {
    loadAlerts();
  }
}, [activePage]);

  return (
    <div className="min-h-screen bg-[#080f1e] text-slate-200">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className={`${mobileMenu ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0c1729] transition-transform duration-300 lg:static lg:translate-x-0`}>
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <Cloud size={23} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide text-white">Atmosense <span className="text-cyan-400">AI</span></h1>
                <p className="text-[10px] tracking-[2px] text-slate-500">ATMOSPHERIC INTELLIGENCE</p>
              </div>
            </div>
            <button onClick={() => setMobileMenu(false)} className="lg:hidden">
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pt-8">
            <p className="mb-4 px-3 text-[10px] font-semibold tracking-[2px] text-slate-500">WORKSPACE</p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = activePage === item.name
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActivePage(item.name)
                      setMobileMenu(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? 'bg-cyan-400/10 font-semibold text-cyan-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                    {item.name === 'Anomaly Detection' && (
                      <span className="ml-auto rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">3</span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-1 border-t border-white/10 p-4">
           
            
          <button
            onClick={() => setActivePage("Help & Support")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <CircleHelp size={18} /> Help & Support
          </button>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-bold text-cyan-300">SA</div>
              <div>
                <p className="text-sm font-medium text-white">System Admin</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <ChevronDown size={15} className="ml-auto text-slate-500" />
            </div>
          </div>
        </aside>

        {mobileMenu && (
          <button
            aria-label="Close navigation"
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenu(true)} className="text-slate-400 lg:hidden">
                <Menu size={22} />
              </button>
              <div>
                <p className="text-xs text-slate-500">Workspace / Overview</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{activePage}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-emerald-300">System operational</span>
              </div>
              
<div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative text-slate-400 hover:text-white"
    title="Notifications"
  >
    <Bell size={19} />
    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-400"></span>
  </button>

  {showNotifications && (
    <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
      <h3 className="mb-2 font-semibold text-white">
        Notifications
      </h3>
      <p className="text-sm text-slate-400">
        You have alerts to review. Visit Alerts & Notifications to view your alert history.
      </p>
    </div>
  )}
</div>

              <div className="hidden h-8 w-px bg-white/10 sm:block"></div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-white">Atmosense Admin</p>
                <p className="text-[10px] text-slate-500">System Manager</p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">
          {activePage !== "Dashboard" && (
  <div className="rounded-2xl border border-white/10 bg-[#101c2e] p-6">
    {activePage === "Sensor Monitoring" && (
      <>
        <form
  onSubmit={handleSaveReading}
  className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
>
  <h3 className="mb-5 text-lg font-semibold text-white">
    Add Sensor Reading
  </h3>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {[
      { name: "station_id", label: "Station ID", type: "text" },
      { name: "temperature_c", label: "Temperature (°C)", type: "number" },
      { name: "humidity_pct", label: "Humidity (%)", type: "number" },
      { name: "pressure_hpa", label: "Pressure (hPa)", type: "number" },
      { name: "wind_speed_ms", label: "Wind Speed (m/s)", type: "number" },
    ].map((field) => (
      <div key={field.name}>
        <label className="mb-2 block text-sm text-slate-300">
          {field.label}
        </label>

        <input
          type={field.type}
          step={field.type === "number" ? "any" : undefined}
          required
          value={formData[field.name]}
          onChange={(event) =>
            setFormData({
              ...formData,
              [field.name]: event.target.value,
            })
          }
          className="w-full rounded-lg border border-white/10 bg-[#0b1728] p-3 text-white outline-none focus:border-cyan-400"
        />
      </div>
    ))}
  </div>

  <button
    type="submit"
    disabled={saving}
    className="mt-5 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
  >
    {saving ? "Saving..." : "Save Sensor Reading"}
  </button>

  {saveMessage && (
    <p className="mt-3 text-sm text-cyan-400">{saveMessage}</p>
  )}
</form>


        <h2 className="text-xl font-bold text-white">Sensor Monitoring</h2>
        <p className="mt-2 text-sm text-slate-400">
          Monitor saved sensor readings from the database.
        </p>
        <div className="mt-5 space-y-3">
          {readings.map((reading) => (
            <div key={reading.id} className="rounded-xl bg-white/5 p-4">
              <p className="font-semibold text-white">{reading.station_id}</p>
              <p className="mt-2 text-sm text-slate-300">
                Temperature: {reading.temperature_c} °C
              </p>
              <p className="text-sm text-slate-300">
                Humidity: {reading.humidity_pct}%
              </p>
              <p className="text-sm text-slate-300">
                Pressure: {reading.pressure_hpa} hPa
              </p>
              <p className="text-sm text-slate-300">
                Wind: {reading.wind_speed_ms} m/s
              </p>
            </div>
          ))}
        </div>
      </>
    )}

    {activePage === "Anomaly Detection" && (
  <>
    <h2 className="text-xl font-bold text-white">
      AI Anomaly Detection
    </h2>

    <p className="mt-2 text-sm text-slate-400">
      Analyze atmospheric sensor readings using the trained Isolation Forest model.
    </p>

    <form
      onSubmit={handleAnomalyDetection}
      className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <h3 className="mb-5 text-lg font-semibold text-white">
        Enter Sensor Parameters
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { name: "temperature_c", label: "Temperature (°C)" },
          { name: "humidity_pct", label: "Humidity (%)" },
          { name: "pressure_hpa", label: "Pressure (hPa)" },
          { name: "wind_speed_ms", label: "Wind Speed (m/s)" },
        ].map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm text-slate-300">
              {field.label}
            </label>

            <input
              type="number"
              step="any"
              required
              value={anomalyData[field.name]}
              onChange={(event) => {
                setAnomalyData({
                  ...anomalyData,
                  [field.name]: event.target.value,
                });
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0b1728] p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={anomalyLoading}
        className="mt-5 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
      >
        {anomalyLoading ? "Analyzing..." : "Run Anomaly Detection"}
      </button>
    </form>

    {anomalyError && (
      <p className="mt-4 text-sm text-red-400">
        {anomalyError}
      </p>
    )}

    {anomalyResult && (
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#101c2e] p-6">
        <h3 className="text-lg font-semibold text-white">
          Detection Results
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Detection Status</p>
            <p className={`mt-2 font-semibold ${
              anomalyResult.is_anomaly
                ? "text-red-400"
                : "text-emerald-400"
            }`}>
              {anomalyResult.status}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Anomaly Score</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {anomalyResult.anomaly_score}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/5 p-4">
          <p className="text-sm text-slate-400">Model Recommendation</p>
          <p className="mt-2 text-sm text-slate-200">
            {anomalyResult.message}
          </p>
        </div>
      </div>
    )}
  </>
)}


{activePage === "Fault Classification" && (
  <>
    <h2 className="text-xl font-bold text-white">
      AI Fault Classification
    </h2>

    <p className="mt-2 text-sm text-slate-400">
      Identify possible atmospheric sensor fault patterns using the trained Random Forest classification model.
    </p>

    <form
      onSubmit={handleFaultClassification}
      className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <h3 className="mb-5 text-lg font-semibold text-white">
        Enter Sensor Parameters
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { name: "temperature_c", label: "Temperature (°C)" },
          { name: "humidity_pct", label: "Humidity (%)" },
          { name: "pressure_hpa", label: "Pressure (hPa)" },
          { name: "wind_speed_ms", label: "Wind Speed (m/s)" },
        ].map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm text-slate-300">
              {field.label}
            </label>

            <input
              type="number"
              step="any"
              required
              value={classificationData[field.name]}
              onChange={(event) => {
                setClassificationData({
                  ...classificationData,
                  [field.name]: event.target.value,
                });
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0b1728] p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={classificationLoading}
        className="mt-5 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
      >
        {classificationLoading
          ? "Classifying..."
          : "Classify Sensor Fault"}
      </button>
    </form>

    {classificationError && (
      <p className="mt-4 text-sm text-red-400">
        {classificationError}
      </p>
    )}

    {classificationResult && (
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#101c2e] p-6">
        <h3 className="text-lg font-semibold text-white">
          Classification Results
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">
              Predicted Fault Type
            </p>
            <p className="mt-2 text-xl font-bold capitalize text-cyan-400">
              {classificationResult.predicted_fault_type.replace(/_/g, " ")}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">
              Model Confidence
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {(classificationResult.confidence * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/5 p-4">
          <p className="text-sm text-slate-400">
            Model Recommendation
          </p>
          <p className="mt-2 text-sm text-slate-200">
            {classificationResult.message}
          </p>
        </div>
      </div>
    )}
  </>
)}


{activePage === "Explainable AI" && (
  <>
    <h2 className="text-xl font-bold text-white">
      Explainable AI - SHAP Analysis
    </h2>

    <p className="mt-2 text-sm text-slate-400">
      Understand which atmospheric sensor parameters influence the fault classification prediction.
    </p>

    <form
      onSubmit={handleExplainability}
      className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <h3 className="mb-5 text-lg font-semibold text-white">
        Enter Sensor Parameters
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { name: "temperature_c", label: "Temperature (°C)" },
          { name: "humidity_pct", label: "Humidity (%)" },
          { name: "pressure_hpa", label: "Pressure (hPa)" },
          { name: "wind_speed_ms", label: "Wind Speed (m/s)" },
        ].map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm text-slate-300">
              {field.label}
            </label>

            <input
              type="number"
              step="any"
              required
              value={explainData[field.name]}
              onChange={(event) => {
                setExplainData({
                  ...explainData,
                  [field.name]: event.target.value,
                });
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0b1728] p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={explainLoading}
        className="mt-5 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
      >
        {explainLoading ? "Analyzing..." : "Explain Prediction"}
      </button>
    </form>

    {explainError && (
      <p className="mt-4 text-sm text-red-400">
        {explainError}
      </p>
    )}

    {explainResult && (
      <div className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-[#101c2e] p-6">
        <h3 className="text-lg font-semibold text-white">
          Explainability Results
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">
              Predicted Fault
            </p>
            <p className="mt-2 text-xl font-bold capitalize text-cyan-400">
              {explainResult.predicted_fault_type.replace(/_/g, " ")}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">
              Model Confidence
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {(explainResult.confidence * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 p-5">
          <h3 className="font-semibold text-white">
            Feature Contributions
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Relative magnitude of each contribution returned by the model.
          </p>

          {Object.entries(explainResult.feature_contributions).map(
            ([feature, contribution]) => {
              const maxContribution = Math.max(
                ...Object.values(explainResult.feature_contributions).map(
                  (value) => Math.abs(value)
                ),
                0.000001
              );

              const percentage =
                (Math.abs(contribution) / maxContribution) * 100;

              return (
                <div key={feature} className="mt-5">
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="capitalize text-slate-300">
                      {feature.replace(/_/g, " ")}
                    </span>

                    <span className={
                      contribution >= 0
                        ? "text-cyan-400"
                        : "text-amber-400"
                    }>
                      {contribution.toFixed(5)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        contribution >= 0
                          ? "bg-cyan-400"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-sm text-slate-400">
            Most Influential Feature
          </p>

          <p className="mt-2 text-lg font-bold capitalize text-cyan-400">
            {explainResult.most_influential_feature.replace(/_/g, " ")}
          </p>
        </div>
      </div>
    )}
  </>
)}

{activePage === "Sensor Health" && (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white">
        Sensor Health Monitoring
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Evaluate sensor reliability, missing readings, abnormal values
        and possible frozen sensors.
      </p>
    </div>

    <form
  onSubmit={handleSensorHealth}
  className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
>
  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Station ID
    </label>

    <input
      type="text"
      value={healthStationId}
      onChange={(e) => setHealthStationId(e.target.value)}
      required
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
      placeholder="Enter station ID"
    />
  </div>

  <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
    <p className="text-sm font-medium text-white">
      Automatic Database Integration
    </p>

    <p className="mt-2 text-sm text-slate-400">
      Sensor Health automatically retrieves saved readings for the
      selected station and evaluates sensor conditions.
    </p>

    <p className="mt-2 text-xs text-slate-500">
      Total saved readings: {readings.length}
    </p>
  </div>

  <button
    type="submit"
    disabled={healthLoading}
    className="rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {healthLoading ? "Assessing..." : "Assess Sensor Health"}
  </button>

  {healthError && (
    <p className="text-sm text-red-400">{healthError}</p>
  )}
</form>

    {healthResult && (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Overall Health Score
            </p>
            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {healthResult.overall_health_score}/100
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Overall Status</p>
            <p className="mt-2 text-2xl font-bold capitalize text-white">
              {healthResult.overall_status.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Individual Sensor Health
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(healthResult.sensor_health).map(
              ([sensor, details]) => (
                <div
                  key={sensor}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-medium text-white">
                      {sensor.replaceAll("_", " ")}
                    </h4>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        details.status === "healthy"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {details.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="mt-4 text-2xl font-bold text-cyan-400">
                    {details.health_score}/100
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-slate-400">
                    <p>
                      Missing readings: {details.missing_readings}
                    </p>
                    <p>
                      Out-of-range readings: {details.out_of_range_readings}
                    </p>
                    <p>
                      Longest repeated sequence:{" "}
                      {details.longest_repeated_sequence}
                    </p>
                    <p>
                      Possible frozen sensor:{" "}
                      {details.possible_frozen_sensor ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <p className="text-sm text-slate-400">
          {healthResult.message}
        </p>
      </div>
    )}
  </div>
)}

    {activePage === "Data Management" && (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white">
        Data Management
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Upload, inspect and preprocess atmospheric sensor datasets.
      </p>
    </div>

    <form
      onSubmit={handleCSVUpload}
      className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
    >
      <h3 className="font-semibold text-white">CSV Dataset Upload</h3>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          setCsvFile(e.target.files?.[0] || null);
          setCsvError("");
          setCsvResult(null);
        }}
        className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-cyan-500"
      />

      {csvFile && (
        <p className="text-sm text-slate-400">
          Selected file: {csvFile.name}
        </p>
      )}

      <button
        type="submit"
        disabled={csvLoading || !csvFile}
        className="rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {csvLoading ? "Uploading..." : "Upload and Analyze CSV"}
      </button>

      {csvError && (
        <p className="text-sm text-red-400">{csvError}</p>
      )}
    </form>

    <button
  type="button"
  onClick={handleCSVPreprocessing}
  disabled={!csvFile || preprocessLoading}
  className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
>
  {preprocessLoading ? "Preprocessing..." : "Preprocess Dataset"}
</button>

{preprocessError && (
  <p className="text-sm text-red-400">{preprocessError}</p>
)}
    {preprocessResult && (
  <div className="space-y-5 rounded-xl border border-emerald-700/40 bg-slate-900 p-5">
    <h3 className="text-lg font-semibold text-emerald-400">
      Preprocessing Results
    </h3>

    <p className="text-sm text-slate-300">
      {preprocessResult.message}
    </p>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        ["Original Rows", preprocessResult.data.original_rows],
        ["Processed Rows", preprocessResult.data.processed_rows],
        ["Duplicates Removed", preprocessResult.data.duplicates_removed],
        ["Missing Values Filled", preprocessResult.data.missing_values_filled],
        ["Remaining Missing Values", preprocessResult.data.remaining_missing_values],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
      ))}
    </div>

    <div className="overflow-x-auto">
      <h4 className="mb-3 font-semibold text-white">
        Cleaned Dataset Preview
      </h4>

      <table className="w-full text-left text-sm">
        <thead className="text-slate-400">
          <tr className="border-b border-slate-700">
            {Object.keys(preprocessResult.data.preview[0] || {}).map((column) => (
              <th key={column} className="whitespace-nowrap p-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {preprocessResult.data.preview.map((record, index) => (
            <tr key={index} className="border-b border-slate-800 text-slate-300">
              {Object.keys(record).map((column) => (
                <td key={column} className="whitespace-nowrap p-3">
                  {record[column] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
    {csvResult && (
      <div className="space-y-5">
        <div className="rounded-xl border border-green-700/40 bg-green-500/5 p-4">
          <p className="font-medium text-green-400">
            {csvResult.message}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            File: {csvResult.filename}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Rows</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {csvResult.data.total_rows}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Columns</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {csvResult.data.total_columns}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Duplicate Rows</p>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {csvResult.data.duplicate_rows}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 font-semibold text-white">
            Column Analysis
          </h3>

          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-700">
                <th className="p-3">Column</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">Missing Values</th>
              </tr>
            </thead>
            <tbody>
              {csvResult.data.columns.map((column) => (
                <tr
                  key={column.name}
                  className="border-b border-slate-800 text-slate-300"
                >
                  <td className="p-3">{column.name}</td>
                  <td className="p-3">{column.data_type}</td>
                  <td className="p-3">{column.missing_values}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 font-semibold text-white">
            Dataset Preview
          </h3>

          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-700">
                {csvResult.data.columns.map((column) => (
                  <th key={column.name} className="p-3 whitespace-nowrap">
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvResult.data.preview.map((record, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 text-slate-300"
                >
                  {csvResult.data.columns.map((column) => (
                    <td key={column.name} className="p-3 whitespace-nowrap">
                      {record[column.name] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}
</div>
)}
{activePage === "Alerts & Notifications" && (
  <div className="space-y-6">

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-white">
          Alerts & Notifications
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Monitor and manage atmospheric sensor alerts.
        </p>
      </div>

      <button
        onClick={loadAlerts}
        disabled={alertsLoading}
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {alertsLoading ? "Refreshing..." : "Refresh Alerts"}
      </button>
    </div>
    {alertsRefreshMessage && (
  <p className="text-sm text-cyan-400">
    {alertsRefreshMessage}
  </p>
)}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        {
          label: "Total Alerts",
          value: alerts.length,
          color: "text-cyan-400"
        },
        {
          label: "Active Alerts",
          value: alerts.filter(a => a.status === "Active").length,
          color: "text-amber-400"
        },
        {
          label: "Critical Alerts",
          value: alerts.filter(
            a => a.severity === "Critical" && a.status === "Active"
          ).length,
          color: "text-red-400"
        },
        {
          label: "Dismissed Alerts",
          value: alerts.filter(a => a.status === "Dismissed").length,
          color: "text-emerald-400"
        }
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-white/5 p-5"
        >
          <p className="text-sm text-slate-400">{item.label}</p>
          <p className={`mt-3 text-3xl font-bold ${item.color}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>

    {alertsError && (
      <p className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
        {alertsError}
      </p>
    )}

    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-5 font-semibold text-white">
        Alert History
      </h3>

      {alertsLoading && alerts.length === 0 ? (
        <p className="text-sm text-slate-400">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-slate-400">
          No alerts available.
        </p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-white/10 bg-[#0b1728] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-3 ${
                    alert.severity === "Critical"
                      ? "bg-red-500/10 text-red-400"
                      : alert.severity === "Warning"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    <AlertTriangle size={20} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-white">
                      {alert.alert_type}
                    </h4>

                    <p className="mt-2 text-sm text-slate-400">
                      {alert.message}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Station: {alert.station_id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    alert.severity === "Critical"
                      ? "bg-red-500/10 text-red-400"
                      : alert.severity === "Warning"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    {alert.severity}
                  </span>

                  <span className={`text-xs ${
                    alert.status === "Active"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>

              {alert.status === "Active" && (
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  disabled={dismissingAlert === alert.id}
                  className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-50"
                >
                  {dismissingAlert === alert.id
                    ? "Dismissing..."
                    : "Dismiss Alert"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
            {activePage === "Dashboard" && (
<>
            {/* Welcome section */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm text-cyan-400">MONITORING OVERVIEW</p>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Atmospheric Intelligence Dashboard</h2>
                <p className="mt-2 text-sm text-slate-400">Monitor environmental conditions and detect sensor abnormalities.</p>
              </div>
              <button className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-[#111e32] px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-400/40">
                <Search size={15} /> Search stations
              </button>
            </section>
{/* Backend Connection */}
<div className="rounded-xl border border-white/10 bg-[#101c2e] p-4">
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-400">Backend Status</span>
    <span className={backendStatus === "healthy" ? "text-emerald-400" : "text-red-400"}>
      {backendStatus}
    </span>
  </div>

  <p className="mt-2 text-sm text-slate-400">
    {loading ? "Loading readings..." : `${readings.length} saved sensor readings`}
  </p>
</div>

{/* Latest Database Readings */}
<div className="rounded-2xl border border-white/[0.07] bg-[#101c2e] p-5">
  <h3 className="font-semibold text-white">Latest Database Readings</h3>

  {readings.length === 0 ? (
    <p className="mt-4 text-sm text-slate-400">No saved readings found.</p>
  ) : (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            <th className="p-3">Station</th>
            <th className="p-3">Temperature</th>
            <th className="p-3">Humidity</th>
            <th className="p-3">Pressure</th>
            <th className="p-3">Wind</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id} className="border-t border-white/10 text-slate-300">
              <td className="p-3">{reading.station_id}</td>
              <td className="p-3">{reading.temperature_c} °C</td>
              <td className="p-3">{reading.humidity_pct} %</td>
              <td className="p-3">{reading.pressure_hpa} hPa</td>
              <td className="p-3">{reading.wind_speed_ms} m/s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
            {/* Summary cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.title} className="rounded-2xl border border-white/[0.07] bg-[#101c2e] p-5 transition hover:border-cyan-400/20">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{metric.title}</p>
                      <div className={`rounded-xl p-2.5 ${metric.bg} ${metric.color}`}>
                        <Icon size={19} />
                      </div>
                    </div>
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight text-white">{metric.value}</span>
                      <span className="text-sm text-slate-400">{metric.unit}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs">
                      {metric.positive ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-amber-400" />}
                      <span className={metric.positive ? 'text-emerald-400' : 'text-amber-400'}>{metric.change}</span>
                      <span className="text-slate-500">vs previous period</span>
                    </div>
                  </div>
                )
              })}
            </section>

{/* Saved Sensor Trend Charts */}
<section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
  {[
    {
      title: "Temperature Trend",
      field: "temperature_c",
      unit: "°C",
      color: "bg-cyan-400",
    },
    {
      title: "Humidity Trend",
      field: "humidity_pct",
      unit: "%",
      color: "bg-violet-400",
    },
  ].map((chart) => {
    const chartData = readings.slice(0, 7).reverse();
    const maxValue = Math.max(
      ...chartData.map((item) => Number(item[chart.field]) || 0),
      1
    );

    return (
      <div
        key={chart.field}
        className="rounded-2xl border border-white/[0.07] bg-[#101c2e] p-5"
      >
        <h3 className="font-semibold text-white">{chart.title}</h3>
        <p className="mt-1 text-xs text-slate-500">
          Based on saved sensor readings
        </p>

        {chartData.length === 0 ? (
          <p className="mt-8 text-sm text-slate-400">
            No sensor readings available. Save readings to view this chart.
          </p>
        ) : (
          <div className="mt-6 flex h-44 items-end justify-around gap-3">
            {chartData.map((reading, index) => {
              const value = Number(reading[chart.field]) || 0;
              const height = Math.max((value / maxValue) * 100, 3);

              return (
                <div
                  key={reading.id ?? index}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] text-slate-300">
                    {value}
                  </span>

                  <div
                    className={`w-full max-w-10 rounded-t-md ${chart.color}`}
                    style={{ height: `${height}%` }}
                    title={`${value} ${chart.unit}`}
                  />

                  <span className="text-[9px] text-slate-500">
                    {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  })}
</section>


            {/* Charts and anomaly summary */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.07] bg-[#101c2e] p-5 xl:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">Environmental Trends</h3>
                    <p className="mt-1 text-xs text-slate-500">Atmospheric readings over time · Demo data</p>
                  </div>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0b1627] px-3 py-2 text-xs text-slate-300 outline-none"
                  >
                    <option>24 Hours</option>
                    <option>7 Days</option>
                    <option>30 Days</option>
                  </select>
                </div>

                <div className="mt-7">
                  <div className="mb-4 flex flex-wrap gap-5 text-xs">
                    <span className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 rounded-full bg-cyan-400"></span>Temperature</span>
                    <span className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 rounded-full bg-violet-400"></span>Humidity</span>
                  </div>
                  <div className="relative h-52 w-full">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[1, 2, 3, 4, 5].map((line) => (
                        <div key={line} className="w-full border-t border-dashed border-white/[0.07]"></div>
                      ))}
                    </div>
                    <svg viewBox="0 0 700 190" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                      <defs>
                        <linearGradient id="temperatureFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity=".22" />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 125 C45 110 60 80 105 95 S170 120 210 80 S280 65 315 90 S380 115 420 65 S490 75 525 50 S600 80 630 45 S675 55 700 25 L700 190 L0 190 Z" fill="url(#temperatureFill)" />
                      <path d="M0 125 C45 110 60 80 105 95 S170 120 210 80 S280 65 315 90 S380 115 420 65 S490 75 525 50 S600 80 630 45 S675 55 700 25" fill="none" stroke="#22d3ee" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                      <path d="M0 150 C50 140 65 125 105 135 S170 115 210 130 S280 120 315 135 S380 125 420 110 S490 130 525 115 S600 125 630 105 S675 120 700 95" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-slate-500">
                    <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#101c2e] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Detection Summary</h3>
                  <AlertTriangle size={18} className="text-amber-400" />
                </div>
                <p className="mt-1 text-xs text-slate-500">AI anomaly monitoring · Demo data</p>
                <div className="mt-7 flex items-center justify-center">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#f87171 0deg 72deg, #fbbf24 72deg 168deg, #26364a 168deg 360deg)' }}>
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#101c2e]">
                      <span className="text-4xl font-bold text-white">03</span>
                      <span className="mt-1 text-xs text-slate-500">Anomalies</span>
                    </div>
                  </div>
                </div>
                <div className="mt-7 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 rounded-full bg-red-400"></span>High severity</span>
                    <span className="font-semibold text-white">1</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 rounded-full bg-amber-400"></span>Medium severity</span>
                    <span className="font-semibold text-white">1</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-500"></span>Low severity</span>
                    <span className="font-semibold text-white">1</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Tables */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101c2e] xl:col-span-2">
                <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
                  <div>
                    <h3 className="font-semibold text-white">Recent Anomalies</h3>
                    <p className="mt-1 text-xs text-slate-500">Latest detected irregular readings</p>
                  </div>
                  <button onClick={() => setActivePage('Anomaly Detection')} className="text-xs text-cyan-400 hover:text-cyan-300">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-white/[0.02] text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">Station</th>
                        <th className="px-5 py-3 font-medium">Parameter</th>
                        <th className="px-5 py-3 font-medium">Anomaly type</th>
                        <th className="px-5 py-3 font-medium">Severity</th>
                        <th className="px-5 py-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {anomalies.map((item) => (
                        <tr key={item.station} className="text-slate-300 hover:bg-white/[0.02]">
                          <td className="px-5 py-4 font-medium text-white">{item.station}</td>
                          <td className="px-5 py-4">{item.parameter}</td>
                          <td className="px-5 py-4">{item.issue}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-1 ${
                              item.severity === 'High' ? 'bg-red-400/10 text-red-400' :
                              item.severity === 'Medium' ? 'bg-amber-400/10 text-amber-400' :
                              'bg-slate-400/10 text-slate-400'
                            }`}>{item.severity}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101c2e]">
                <div className="border-b border-white/[0.07] p-5">
                  <h3 className="font-semibold text-white">Station Health</h3>
                  <p className="mt-1 text-xs text-slate-500">Connected monitoring stations</p>
                </div>
                <div className="space-y-5 p-5">
                  {stations.map((station) => (
                    <div key={station.name}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{station.name}</p>
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><MapPin size={11} />{station.location}</p>
                        </div>
                        <span className={`text-xs ${station.status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>{station.status}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${station.health < 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${station.health}%` }}></div>
                      </div>
                      <p className="mt-1 text-right text-[10px] text-slate-500">{station.health}% health score</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            </>
)}
            <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.07] py-5 text-[10px] text-slate-600 sm:flex-row">
              <span>Atmosense AI · Intelligent Atmospheric Sensor Anomaly Detection System</span>
              <span>Prototype dashboard · Sample readings only</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App