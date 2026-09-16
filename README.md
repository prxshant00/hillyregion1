# FloodSight — Hyper-Local Flash Flood Early Warning System for Hilly Regions

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg)](https://www.typescriptlang.org/)
[![Tests Passing](https://img.shields.io/badge/tests-24%20passed-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-72%25-brightgreen.svg)]()

> **Smart India Hackathon 2026 — Problem Statement SIH26192**  
> **Nodal Ministry**: Ministry of Home Affairs (NDRF / National Disaster Response Force)  
> **Validation Case**: Mandi, Kullu, and Kangra Districts, Himachal Pradesh (Cross-referenced against real June–August 2025 flash flood & cloudburst events).

---

## 1. Problem Statement & Motivation
Existing national flood forecasting by the Central Water Commission (CWC) covers 332 major-river gauge stations at the macro-basin level — it cannot identify which specific village or ward in steep mountain valleys will flood during intense convective cloudbursts. Similarly, NRSC’s Bhuvan Landslide Early Warning System is limited to only three pilgrimage corridors.

**FloodSight** extends high-resolution early warning down to **ward and tehsil level granularity** across hilly states. It fuses real-time satellite rainfall, high-resolution digital elevation (DEM), soil moisture saturation, and field IoT sonar river gauges into **probabilistic, explainable risk scores with 2.5 to 6.0 hours of actionable lead time**.

---

## 2. System Architecture

```
                                  [EXTERNAL DATA SOURCES]
  +--------------------+   +--------------------+   +--------------------+   +--------------------+
  |  IMD / Open-Meteo  |   |    SRTM 30m DEM    |   | NASA SMAP / ECMWF  |   |  ESP32 IoT Sensors |
  | (Real-time Rain)   |   | (Slope / Aspect)   |   |  (Soil Saturation) |   | (River Stage/Tilt) |
  +---------+----------+   +---------+----------+   +---------+----------+   +---------+----------+
            |                        |                        |                        |
            v                        v                        v                        v
  +-----------------------------------------------------------------------------------------------+
  |                      ADAPTER INGESTION LAYER (BaseAdapter Interface)                         |
  |   - Graceful Degradation: Isolated health tracking, retries, latency metrics, and status flags |
  +----------------------------------------------+------------------------------------------------+
                                                 |
                                                 v
  +-----------------------------------------------------------------------------------------------+
  |                           FLOODSIGHT CORE BACKEND (FastAPI & Pydantic v2)                     |
  |                                                                                               |
  |  +---------------------------+  +--------------------------+  +----------------------------+  |
  |  |   Ward Spatial Registry   |  |   8-Factor ML Scorer     |  |    Explainable AI Engine   |  |
  |  |  (Mandi, Kullu, Kangra)   |  | (RandomForest Balanced)  |  | (Factor Contribution Tree) |  |
  |  +---------------------------+  +--------------------------+  +----------------------------+  |
  |                                                                                               |
  |  +-----------------------------------------------------------------------------------------+  |
  |  |           REST API Endpoints (/api/v1/risk, /history, /events, /alerts, /sources)       |  |
  |  +-----------------------------------------------------------------------------------------+  |
  +-----------------------+-----------------------------------------------+-----------------------+
                          |                                               |
                          v                                               v
        +-----------------------------------+           +-----------------------------------+
        |       NOTIFICATION DISPATCHER     |           |     TACTICAL DASHBOARD (HUD)      |
        |  - Provider Abstraction           |           |  - React 18 + TypeScript + Vite   |
        |  - Twilio SMS / Console Mock      |           |  - Leaflet Ward Choropleth Heatmap|
        |  - Directives to EOC / NDRF       |           |  - Bilingual (English + हिन्दी)   |
        |  - 100% Traceable Dispatch Logs   |           |  - 2025 Ground Truth Event Overlay|
        +-----------------------------------+           +-----------------------------------+
```

---

## 3. Strict Metric Transparency: Academic Precedent vs. Measured Holdout

To maintain engineering and scientific integrity, this system strictly demarcates published academic benchmarks from our empirical validation measurements.

| Metric | Academic Reference (Yunnan RF Study)* | **FloodSight Measured (Our Validation)** | Physical & Life-Safety Impact |
| :--- | :---: | :---: | :--- |
| **Accuracy** | 90.60% | **98.87%** | Strong overall discrimination across monsoon days |
| **ROC-AUC** | 0.954 | **0.9947** | High discriminative threshold stability |
| **Recall (Sensitivity)** | *Not reported* | **100.00%** | **Core NDRF Safety Mandate: Zero missed flash floods (TP=4, FN=0)** |
| **Precision** | *Not reported* | **36.36%** | Calibrated for early warning sensitivity (false alarms preferred over loss of life) |
| **F1-Score** | *Not reported* | **53.33%** | Harmonic balance under severe class imbalance |
| **Validation Window** | Regional Catchment (China) | **June 1 – Aug 31, 2025** | **Real documented Himachal disaster window (Holdout)** |

*\*Academic Citation: Referenced as architectural precedent from peer-reviewed literature on random forest modeling for rainfall-induced landslides and debris flows in Yunnan steep-terrain catchments. This benchmark is cited as a design baseline, NOT our result.*

---

## 4. Feature Schema (8 Factors) & Explainability
Every risk score (0 to 100) produced by FloodSight is fully explainable via factor impact contributions:
1. `rainfall_current_24h` (55.37% importance): Primary cloudburst trigger (>100 mm/24h or extreme hourly surge).
2. `rainfall_antecedent_72h` (34.94% importance): Cumulative antecedent saturation reducing terrain infiltration.
3. `ndvi` (4.35% importance): Vegetation cover and root cohesion resisting soil slippage.
4. `aspect` (2.79% importance): Slope orientation and monsoon windward moisture intercept.
5. `elevation` (1.24% importance): Mountain elevation channeling runoff into narrow gorge catchments.
6. `slope` (0.82% importance): Gravitational shear stress; slopes >25° are highly prone.
7. `lithology` (0.33% importance): Fragility index (e.g. sheared phyllite, schist, unconsolidated river alluvium).
8. `soil_type` (0.12% importance): Soil texture (clayey loam vs permeable gravelly loam).

---

## 5. API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/risk/all` | Returns real-time risk summaries for all 20 wards in Mandi, Kullu, Kangra. |
| `GET` | `/api/v1/risk/{ward_id}` | Detailed ward risk score, alert level, lead time, and 8-factor contribution breakdown. |
| `GET` | `/api/v1/risk/district/{name}` | Returns district wards for choropleth rendering (`Mandi`, `Kullu`, `Kangra`). |
| `GET` | `/api/v1/history/{ward_id}` | 48-hour time series of rainfall, computed risk index, and river water level. |
| `POST` | `/api/v1/ingest/rainfall` | Idempotent rainfall ingestion trigger from IMD / Open-Meteo. |
| `POST` | `/api/v1/ingest/sensor` | Common schema ingestion for ESP32 IoT nodes (`source: "sensor"`). |
| `POST` | `/api/v1/alerts/trigger` | Dispatches emergency SMS directives to NDRF / DEOC teams. |
| `GET` | `/api/v1/model/info` | Live Model Card serving exact parameters, measured metrics, and citations. |
| `GET` | `/api/v1/events/validation` | Real documented June–August 2025 events with model prediction verification. |
| `GET` | `/api/v1/sources/status` | Real-time health, latency, and operational status of all data adapters. |
| `GET` | `/api/v1/wards/geojson` | Topographical GeoJSON boundaries for Leaflet map overlay. |

---

## 6. Quickstart Guide

### Option A: Local Development (Instant Startup)

1. **Clone and setup virtual environment**:
   ```bash
   git clone <repo-url>
   cd hillyregion1
   python -m venv .venv
   source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Train model and execute test suite**:
   ```bash
   python -m floodsight.modeling.train
   pytest tests/ -v --cov=floodsight --cov-report=term-missing
   ```

3. **Start the FastAPI Backend**:
   ```bash
   python -m uvicorn floodsight.backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start the Tactical React Dashboard**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

### Option B: Full Stack Docker Compose

```bash
docker compose up --build
```
This orchestrates:
- `floodsight-db`: PostgreSQL 15 + PostGIS
- `floodsight-mqtt`: Mosquitto MQTT broker for field telemetry
- `floodsight-api`: FastAPI backend on port 8000
- `floodsight-frontend`: Nginx serving the React dashboard on port 5173

---

## 7. IoT Field Hardware Simulation (ESP32)

An ESP32 ultrasonic water-level and tilt sensor node simulator is included in `hardware_sim/esp32_flood_node.py`:
```bash
python hardware_sim/esp32_flood_node.py --mode surge --iterations 10
```
This pushes real-time telemetry into `/api/v1/ingest/sensor` and immediately updates river stage and risk levels on the dashboard.

---

## 8. License & Acknowledgments
Built for **Smart India Hackathon 2026** (Problem Statement SIH26192).  
Acknowledges open geospatial and weather datasets from IMD, NRSC/Bhuvan, OpenTopography, Open-Elevation, and Open-Meteo.
