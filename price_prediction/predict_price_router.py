from pathlib import Path
from typing import List, Literal, Annotated
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# ---------------------------------------------------------------------------
# Load artifacts relative to the price_prediction/ directory
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "house_price_model.pkl")
df: pd.DataFrame = joblib.load(BASE_DIR / "df.pkl")

SECTORS = tuple(sorted(df["sector"].dropna().astype(str).unique().tolist()))


# ---------------------------------------------------------------------------
# Pydantic Schemas (Exact match with Model Selection.ipynb Cell 81 & Cell 87)
# ---------------------------------------------------------------------------
class PropertyData(BaseModel):
    bedRoom: Annotated[int, Field(..., ge=1, le=20, description="Number of bedrooms")]
    bathroom: Annotated[int, Field(..., ge=1, le=20, description="Number of bathrooms")]
    built_up_area: Annotated[float, Field(..., gt=100, description="Built-up area in sq.ft.")]
    servant_room: Annotated[Literal["Yes", "No"], Field(..., description="Do you want Servent Room")]
    store_room: Annotated[Literal["Yes", "No"], Field(..., description="Do you want Store Room")]
    property_type: Annotated[Literal["Flat", "House"], Field(..., description="Type of Property")]
    sector: Annotated[Literal[SECTORS], Field(..., description="Name of the Sector")]  # type: ignore
    balcony: Annotated[Literal["0", "1", "2", "3", "3+"], Field(..., description="Number of balcony")]
    agePossession: Annotated[Literal[
        "Old Property",
        "Moderately Old",
        "Relatively New",
        "New Property",
        "Under Construction",
    ], Field(..., description="Age of the property", examples=["Old Property", "New Property"])]
    furnishing_type: Annotated[Literal["Unfurnished", "Semifurnished", "Furnished"], Field(..., description="Furnishing type of property")]
    luxury_category: Annotated[Literal["Low", "Medium", "High"], Field(..., description="Type of luxury")]
    floor_category: Annotated[Literal["Low Floor", "Mid Floor", "High Floor"], Field(..., description="Type of floor")]
    facing: Annotated[Literal[
        "East",
        "North",
        "South",
        "West",
        "North-East",
        "North-West",
        "South-East",
        "South-West",
    ], Field(..., description="Facing direction of property")]


class PredictionResponse(BaseModel):
    predicted_price_limit: List[float]
    message: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("/api/sectors", response_model=List[str])
def get_sectors():
    """Returns all valid sectors from df.pkl for the frontend dropdown."""
    return list(SECTORS)


@router.post("/predict", response_model=PredictionResponse)
def predict(data: PropertyData):
    servant_room = 1 if data.servant_room == "Yes" else 0
    store_room = 1 if data.store_room == "Yes" else 0

    # Column order matches X in Model Selection.ipynb
    input_row = pd.DataFrame(
        [
            {
                "bedRoom": data.bedRoom,
                "bathroom": data.bathroom,
                "built_up_area": data.built_up_area,
                "servant_room": servant_room,
                "store_room": store_room,
                "property_type": data.property_type,
                "sector": data.sector,
                "balcony": data.balcony,
                "agePossession": data.agePossession,
                "furnishing_type": data.furnishing_type,
                "luxury_category": data.luxury_category,
                "floor_category": data.floor_category,
                "facing": data.facing,
            }
        ]
    ) 

    try:
        prediction = float(model.predict(input_row)[0])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")

    base_price = float(np.expm1(prediction))
    low = max(0.05, round(base_price - 0.22, 2))
    high = round(base_price + 0.22, 2)
    price_limit = [low, high]

    return PredictionResponse(
        predicted_price_limit=price_limit,
        message=f"The price of the {data.property_type} is between ₹ {price_limit[0]} Cr and ₹ {price_limit[1]} Cr.",
    )