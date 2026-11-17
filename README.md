# 🏙️ AravaliIndex — Gurgaon Real Estate Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5%2B-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Optuna](https://img.shields.io/badge/Optuna-Hyperparameter%20Tuning-5C4EE5)](https://optuna.org/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%7C%20HTML5%20%7C%20CSS3-0F766E)](#)

**AravaliIndex** is an end-to-end production-ready Machine Learning web application for the **Gurgaon (Gurugram) residential real estate market**. It combines two core ML systems served through a unified **FastAPI** backend and an interactive editorial web UI:

1. **Residential Property Price Valuation Engine:** Predicts fair-market property valuation bands (in ₹ Crores) across **106 Gurgaon sectors** using an Optuna-tuned **Random Forest Regressor** trained on **13,134 cleaned property listings** (`11,909 Flats` and `1,225 Independent Houses`).
2. **Geospatial & Hybrid Content-Based Property Recommender:** Filters **635 verified residential societies** within a user-specified commute radius (in km) across **1,111 Gurgaon localities/landmarks**, and computes **Top-10 similar projects** using a weighted multi-modal **Cosine Similarity** engine ($30 \cdot \text{Sim}_1 + 20 \cdot \text{Sim}_2 + 8 \cdot \text{Sim}_3$).

## 📌 Key Highlights & Model Impact (Executive Summary)

* **Massive Error (Loss) Reduction:** Reduced Mean Absolute Error (**MAE**) from **₹ 1.1152 Cr** (Ordinal Linear Regression baseline) and **₹ 0.7659 Cr** (One-Hot Linear Regression baseline) down to **₹ 0.4491 Cr** on the untouched holdout test set — a **59.73% total reduction in prediction error** (**-₹ 0.6661 Cr**) over initial encoding and a **41.36% loss reduction** (**-₹ 0.3167 Cr**) over the OHE Linear baseline.
* **Significant $R^2$ (Accuracy) Gain:** Improved 10-Fold Cross-Validation $R^2$ from **0.6880** (initial Ordinal baseline) and **0.8285** (OHE Linear baseline) to **0.9214** (35-trial Optuna study) / **0.9196** (100-trial Optuna study), achieving **0.9124 $R^2$ on the unseen holdout test set** (**+23.16 percentage points** / **+33.66% relative improvement**).
* **Multi-Strategy Feature Encoding Architecture:** Benchmarked **6 distinct encoding pipelines** across **11 regression algorithms** using 10-fold cross-validation and **Optuna TPE Bayesian optimization** before selecting the hybrid **StandardScaler + OrdinalEncoder + OneHotEncoder + Smoothed TargetEncoder** pipeline.
* **Zero-Duplicate Visual Catalog:** Maps all **635 unique Gurgaon residential societies** to **635 unique property photographs** and direct **99acres** project links (`link_of_property_photo.pkl` & `see_property_link.pkl`).

## 🗂️ Repository Architecture

```text
├── main.py                                  # FastAPI entrypoint mounting API routers & static UI
├── requirements.txt                         # Python dependencies
├── price_prediction/                        # Module 1: ML Price Valuation Service
│   ├── __init__.py
│   ├── df.pkl                               # Feature reference DataFrame (13,134 rows × 13 cols)
│   ├── house_price_model.pkl                # Optuna-tuned RandomForest Pipeline (compressed joblib)
│   └── predict_price_router.py              # FastAPI router: GET /api/sectors, POST /predict
├── recomendation/                           # Module 2: Geospatial & Cosine Similarity Service
│   ├── __init__.py
│   ├── cosine_sim1.pkl                      # TF-IDF Cosine Similarity on TopFacilities (635×635)
│   ├── cosine_sim2.pkl                      # Cosine Similarity on BHK Price & Area Details (635×635)
│   ├── cosine_sim3.pkl                      # Cosine Similarity on LocationAdvantages (635×635)
│   ├── locality_df.pkl                      # Geodesic distance matrix (635 societies × 1,111 localities)
│   ├── link_of_property_photo.pkl           # 635 unique PropertyName -> PHOTO_URL mappings
│   ├── see_property_link.pkl                # 635 PropertyName -> 99acres listing URLs
│   └── recomendation_router.py              # FastAPI router: /api/localities, /api/recommend, /api/similar
├── static/                                  # Interactive Frontend (Light Editorial Theme)
│   ├── index.html                           # 2-Tab SPA layout (Valuation + Recommender)
│   ├── style.css                            # Custom responsive design system
│   └── app.js                               # Async API client, compass rose, live sliders & cards
└── Notebooks/                               # End-to-End ML Lifecycle Notebooks
    ├── Data Cleaning Notebooks/             # Raw scraping cleanup (Flats, Houses, Merge)
    ├── Outlier Treatment/                   # IQR, domain bounds & area-to-bedroom ratio filtering
    ├── Missing Value Imputation/            # Built-up/Super-built-up/Carpet ratio imputation
    ├── Feature Engineering/                 # Luxury score clustering & floor categorization
    ├── Feature Selection/                   # 8-method feature importance consensus
    └── Model Training/                      # Baseline Model, Model Selection (Optuna), Recommender
```

> **Note on `house_price_model.pkl`:** Because the serialized 750-tree `RandomForestRegressor` pipeline exceeds GitHub's standard file preview limits, its placement inside `price_prediction/house_price_model.pkl` is verified in the project directory screenshot (`Screenshot 2026-11-15 121850.png`) and can be regenerated directly by running the final cells of `Model Training/Model Selection.ipynb`.

## 🔬 End-to-End Machine Learning Pipeline

### 1. Data Cleaning & Harmonization (`13,559` $\rightarrow$ `13,134` Listings)
* Merged separate raw datasets of Gurgaon **Flats/Apartments** and **Independent Houses** into a unified schema.
* Standardized heterogeneous area units (`sq.ft.`, `sq.yards`, `sq.m.`), parsed nested JSON/dict strings for `PriceDetails`, `LocationAdvantages`, and `TopFacilities`, and normalized sector names across **106 canonical Gurgaon sectors**.

### 2. Outlier Detection & Domain-Specific Treatment
* **Price & Price-per-Sq.Ft. Corrections:** Identified 1,052 raw price outliers and 983 `price_per_sqft` anomalies where independent house rates were mistakenly quoted per *sq.yard* instead of *sq.ft.* (resolved by dividing rate by 9 where applicable and capping extreme luxury outliers $> ₹ 50,000/\text{sq.ft.}$).
* **Spatial & Room Ratio Filtering:** Removed erroneous entries with `bedRoom > 10` or implausible `built_up_area / bedRoom < 100 sq.ft.`, reducing `area` standard deviation from **17,597 sq.ft.** to **1,383 sq.ft.**

### 3. Missing Value Imputation
* **Empirical Area Conversion Ratios:** Computed median ratios across 2,347 complete records:
  * $\text{Super Built-up to Built-up Ratio} = 1.1111$
  * $\text{Carpet to Built-up Ratio} = 0.8889$
* Used these exact ratios to impute missing `built_up_area` values from `super_built_up_area` and `carpet_area` with **zero remaining nulls**.
* Imputed missing `floorNum` on independent houses using the category median (`2.0`) and resolved `Undefined` `agePossession` values via sector-and-society mode lookup.

### 4. Feature Engineering & Multi-Method Feature Selection
* **`luxury_category`:** Weighted 35+ society amenities into a continuous `luxury_score` and binned it into `Low` ($0–49$), `Medium` ($50–149$), and `High` ($\ge 150$).
* **`floor_category`:** Grouped `floorNum` into `Low Floor` ($0–2$), `Mid Floor` ($3–10$), and `High Floor` ($>10$).
* **8-Technique Feature Selection Consensus:** Evaluated all candidate features using Pearson Correlation, Random Forest Importance, Gradient Boosting Importance, Permutation Importance, LASSO Coefficients, Recursive Feature Elimination (RFE), Linear Regression Weights, and SHAP TreeExplainer values — retaining the **13 highest-signal features**:
  * **Numeric (5):** `bedRoom`, `bathroom`, `built_up_area`, `servant_room`, `store_room`
  * **Categorical (8):** `property_type`, `sector`, `balcony`, `agePossession`, `furnishing_type`, `luxury_category`, `floor_category`, `facing`
* **Target Transformation:** Applied log-transformation $y_{\text{trans}} = \ln(1 + y)$ to handle right-skewness in property prices, evaluating predictions in real Crore units via $\hat{y} = \exp(\hat{y}_{\text{trans}}) - 1$.

## 📊 Model Comparison & Loss Reduction Progression

### Encoding Strategy Progression (10-Fold CV $R^2$ & Test MAE in ₹ Cr)

| Encoding Strategy | Best Linear ($R^2$) | Best Linear (MAE) | Best Tree ($R^2$) | Best Tree (MAE) |
| :--- | :---: | :---: | :---: | :---: |
| **1. Ordinal Encoding** | 0.6880 | ₹ 1.1151 Cr | 0.9034 (XGB) | ₹ 0.5192 Cr |
| **2. Baseline OHE** | 0.8285 | ₹ 0.7659 Cr | 0.8977 (SVR) | ₹ 0.5729 Cr |
| **3. OHE + Ordinal** | 0.8252 | ₹ 0.7717 Cr | 0.9098 (ET) | ₹ 0.4841 Cr |
| **4. OHE + PCA (0.95)** | 0.8252 | ₹ 0.7700 Cr | 0.9110 (ET) | ₹ 0.4789 Cr |
| **5. Target Encoding** | 0.8079 | ₹ 0.8246 Cr | 0.9118 (RF) | ₹ 0.4745 Cr |
| **6. Hybrid Mix Encoding** | 0.8264 | ₹ 0.7705 Cr | 0.9189 (ET) | ₹ 0.4629 Cr |
| **7. Optuna Tuned RF (Final)** | — | — | **0.9214 (CV) / 0.9124 (Test)** | **₹ 0.4491 Cr** |

### Full Algorithm Benchmark (Hybrid Mix Encoding — Pre-Final Tuning)

| Rank | Algorithm | 10-Fold CV $R^2$ | Test MAE (₹ Cr) | Error vs Ordinal LR |
| :---: | :--- | :---: | :---: | :---: |
| **1** | **ExtraTreesRegressor** | **0.9189** | **0.4629 Cr** | **-58.49%** |
| **2** | **RandomForestRegressor** | **0.9141** | **0.4677 Cr** | **-58.06%** |
| **3** | **XGBRegressor** | **0.9090** | **0.4968 Cr** | **-55.45%** |
| 4 | LGBMRegressor | 0.9030 | 0.5300 Cr | -52.48% |
| 5 | SVR (RBF Kernel) | 0.8968 | 0.5468 Cr | -50.97% |
| 6 | MLPRegressor | 0.8869 | 0.5591 Cr | -49.87% |
| 7 | DecisionTreeRegressor | 0.8386 | 0.6147 Cr | -44.88% |
| 8 | GradientBoostingRegressor | 0.8777 | 0.6204 Cr | -44.37% |
| 9 | LinearRegression | 0.8264 | 0.7705 Cr | -30.91% |
| 10 | Ridge Regression | 0.8264 | 0.7713 Cr | -30.84% |
| 11 | AdaBoostRegressor | 0.7642 | 0.8870 Cr | -20.46% |

### Final Optuna Hyperparameter Tuning (Top 3 Models $\rightarrow$ 100-Trial Deep Tuning)

After benchmarking all 11 models, the top 3 ensemble architectures (`RandomForestRegressor`, `ExtraTreesRegressor`, and `XGBRegressor`) underwent intensive Bayesian hyperparameter optimization using **Optuna (`TPESampler`)**:

| Model | Optuna Trials | Best 10-Fold CV $R^2$ | Holdout Test $R^2$ | Holdout Test MAE |
| :--- | :---: | :---: | :---: | :---: |
| **RandomForestRegressor (Selected)** | **100 Trials** | **0.9214 / 0.9196** | **0.9124** | **₹ 0.4491 Cr** |
| ExtraTreesRegressor | 30 Trials | 0.9201 | 0.9191 | ₹ 0.4633 Cr |
| XGBRegressor | 100 Trials | 0.9196 | 0.9196 | ₹ 0.4732 Cr |

**Winning Hyperparameters (`house_price_model.pkl`):**
```python
RandomForestRegressor(
    bootstrap=False,
    n_estimators=750,
    max_depth=31,
    min_samples_split=3,
    min_samples_leaf=1,
    max_features=0.38058019569051804,
    n_jobs=-1,
    random_state=42
)
```

### Summary of Accuracy Gain & Loss Reduction
* ** vs. Initial Ordinal Linear Regression (`R2 = 0.6880`, `MAE = ₹ 1.1152 Cr`):**
  * **Accuracy ($R^2$) Improved by:** `+23.16 percentage points` (**+33.66% relative gain**)
  * **Loss (MAE) Reduced by:** `-₹ 0.6661 Cr` (**59.73% error reduction**)
* ** vs. Baseline OHE Linear Regression (`R2 = 0.8285`, `MAE = ₹ 0.7659 Cr`):**
  * **Accuracy ($R^2$) Improved by:** `+9.11 percentage points` (**+11.00% relative gain**)
  * **Loss (MAE) Reduced by:** `-₹ 0.3167 Cr` (**41.36% error reduction**)
* ** vs. Baseline RBF SVR (`R2 = 0.8977`, `MAE = ₹ 0.5729 Cr`):**
  * **Accuracy ($R^2$) Improved by:** `+2.19 percentage points` (**+2.44% relative gain**)
  * **Loss (MAE) Reduced by:** `-₹ 0.1238 Cr` (**21.61% error reduction**)

## 🧭 Hybrid Property Recommendation Engine

The recommendation module (`recomendation/recomendation_router.py`) operates in two stages across **635 verified Gurgaon residential societies**:

1. **Stage 1 — Geospatial Radius Filtering (`/api/recommend`):**
   * Queries `locality_df.pkl` (a $635 \times 1,111$ distance matrix storing distances in meters between every residential society and 1,111 Gurgaon landmarks, metro stations, schools, hospitals, and corporate hubs).
   * Filters properties within `radius_km * 1000` meters (excluding sentinel `54,000m` missing values) and sorts results by exact proximity in kilometers.
2. **Stage 2 — Weighted Multi-Modal Cosine Similarity (`/api/similar`):**
   * Combines three distinct $635 \times 635$ cosine similarity matrices:
     * $\text{Sim}_1$ (`cosine_sim1.pkl`): TF-IDF bi-gram vector similarity over society amenities (`TopFacilities`).
     * $\text{Sim}_2$ (`cosine_sim2.pkl`): Standardized numerical & categorical similarity over BHK configurations, price brackets, and carpet/super-built-up areas (`PriceDetails`).
     * $\text{Sim}_3$ (`cosine_sim3.pkl`): Proximity similarity across surrounding landmarks and social infrastructure (`LocationAdvantages`).
   * Computes the combined similarity matrix:
     $$\text{Combined\_Sim} = 30 \cdot \text{Sim}_1 + 20 \cdot \text{Sim}_2 + 8 \cdot \text{Sim}_3$$
   * Returns the top-$N$ most similar residential societies with normalized similarity progress bars, unique property photography, and direct **99acres** links.

## 🔌 FastAPI REST Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/sectors` | Returns all 106 sorted Gurgaon sectors from `df.pkl` |
| `POST` | `/predict` | Validates 13 property features via Pydantic & returns `[low, high]` Cr valuation |
| `GET` | `/api/localities` | Prefix-first autocomplete search across 1,111 Gurgaon localities (`?q=...&limit=20`) |
| `GET` | `/api/recommend` | Returns societies within `radius_km` of `locality` sorted by distance |
| `GET` | `/api/similar` | Returns Top-10 similar societies for `property_name` using `COMBINED_SIM` |

## 🚀 Local Setup & Execution

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
pip install -r requirements.txt
```

### 2. Verify Artifacts
Ensure `house_price_model.pkl` is placed inside `price_prediction/` (as shown in the directory structure above; if cloning fresh without Git LFS, run the final section of `Model Training/Model Selection.ipynb` to generate `house_price_model.pkl`).

### 3. Launch the FastAPI Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access the Application
* **Interactive Web UI:** [http://localhost:8000](http://localhost:8000)
* **Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
