import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from price_prediction.predict_price_router import router as predict_price_router
from recomendation.recomendation_router import router as recomendation_router

app = FastAPI(
    title="Gurgaon Property Price Prediction and Recommender",
    version="1.0.0",
)

# Register API routers first (before mounting StaticFiles at "/")
app.include_router(predict_price_router, tags=["Price Prediction"])
app.include_router(recomendation_router, tags=["Property Recommendation"])

# ---------------------------------------------------------------------------
# Static frontend (mounted LAST so it doesn't shadow /predict or /api routes)
# ---------------------------------------------------------------------------
# os.makedirs("static", exist_ok=True)
app.mount("/", StaticFiles(directory="static", html=True), name="static")