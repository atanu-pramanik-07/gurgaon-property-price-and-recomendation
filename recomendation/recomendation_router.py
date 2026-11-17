from pathlib import Path
from typing import Annotated, List, Optional
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

router = APIRouter()

# ---------------------------------------------------------------------------
# Load artifacts relative to the recomendation/ directory (once, at startup)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

location_df: pd.DataFrame = joblib.load(BASE_DIR / "locality_df.pkl")          # index=PropertyName, cols=localities, values=meters
link_df: pd.DataFrame = joblib.load(BASE_DIR / "see_property_link.pkl")        # PropertyName, Link
photo_df: pd.DataFrame = joblib.load(BASE_DIR / "link_of_property_photo.pkl")  # PropertyName, PHOTO_URL
cosine_sim1: np.ndarray = joblib.load(BASE_DIR / "cosine_sim1.pkl")
cosine_sim2: np.ndarray = joblib.load(BASE_DIR / "cosine_sim2.pkl")
cosine_sim3: np.ndarray = joblib.load(BASE_DIR / "cosine_sim3.pkl")

MISSING_DISTANCE = 54000.0  # fill value meaning "not near this locality"

# Same weights as your Property Recomendation.ipynb notebook
COMBINED_SIM: np.ndarray = (30 * cosine_sim1) + (20 * cosine_sim2) + (8 * cosine_sim3)

PROPERTY_NAMES: List[str] = location_df.index.astype(str).tolist()
NAME_TO_POS = {name: i for i, name in enumerate(PROPERTY_NAMES)}
NAME_LOWER_TO_POS = {name.lower(): i for i, name in enumerate(PROPERTY_NAMES)}

LOCALITIES: List[str] = location_df.columns.astype(str).tolist()
LOCALITY_LOWER = {loc.lower(): loc for loc in LOCALITIES}

LINK_MAP = dict(zip(link_df["PropertyName"].astype(str), link_df["Link"]))
PHOTO_MAP = dict(zip(photo_df["PropertyName"].astype(str), photo_df["PHOTO_URL"]))


# ---------------------------------------------------------------------------
# Pydantic models: request validation
# ---------------------------------------------------------------------------
Text = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]
RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class LocalitySearchParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    q: Text = Field("", description="Text typed by the user in the search box")
    limit: int = Field(20, ge=1, le=100, description="Max suggestions to return")


class RecommendParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    locality: RequiredText = Field(..., description="Locality selected by the user")
    radius_km: float = Field(
        ..., gt=0, le=100, allow_inf_nan=False, description="Radius in KM (0 < radius <= 100)"
    )


class SimilarParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    property_name: RequiredText = Field(..., description="Property name the user clicked")
    top_n: int = Field(10, ge=1, le=50, description="Number of similar properties")


# ---------------------------------------------------------------------------
# Pydantic models: response validation
# ---------------------------------------------------------------------------
class PropertyCard(BaseModel):
    property_name: str
    image_url: Optional[str] = None
    property_link: Optional[str] = None  # target of the "See Property" button (99acres)


class NearbyPropertyCard(PropertyCard):
    distance_km: float


class SimilarPropertyCard(PropertyCard):
    similarity_score: float


class LocalitySearchResponse(BaseModel):
    localities: List[str]


class RecommendResponse(BaseModel):
    locality: str
    radius_km: float
    count: int
    properties: List[NearbyPropertyCard]


class SimilarResponse(BaseModel):
    selected_property: PropertyCard
    count: int
    recommendations: List[SimilarPropertyCard]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _clean(value) -> Optional[str]:
    """Convert NaN/None to None so the response passes validation."""
    if value is None or pd.isna(value):
        return None
    return str(value)


def _base_card(name: str) -> dict:
    return {
        "property_name": name,
        "image_url": _clean(PHOTO_MAP.get(name)),
        "property_link": _clean(LINK_MAP.get(name)),
    }


def _resolve_locality(user_locality: str) -> str:
    key = LOCALITY_LOWER.get(user_locality.lower())
    if key is not None:
        return key
    matches = [loc for loc in LOCALITIES if user_locality.lower() in loc.lower()]
    if matches:
        return matches[0]
    raise HTTPException(status_code=404, detail=f"Locality '{user_locality}' not found.")


def _resolve_property_pos(user_property: str) -> int:
    pos = NAME_TO_POS.get(user_property)
    if pos is not None:
        return pos
    pos = NAME_LOWER_TO_POS.get(user_property.lower())
    if pos is not None:
        return pos
    matches = [i for i, name in enumerate(PROPERTY_NAMES) if user_property.lower() in name.lower()]
    if matches:
        return matches[0]
    raise HTTPException(status_code=404, detail=f"Property '{user_property}' not found.")


# ---------------------------------------------------------------------------
# 1. Search locality (autocomplete from locality_df.pkl columns)
# ---------------------------------------------------------------------------
@router.get("/api/localities", response_model=LocalitySearchResponse)
def search_localities(params: Annotated[LocalitySearchParams, Query()]):
    q = params.q.lower()
    if not q:
        return LocalitySearchResponse(localities=LOCALITIES[: params.limit])

    starts = [loc for loc in LOCALITIES if loc.lower().startswith(q)]
    contains = [loc for loc in LOCALITIES if q in loc.lower() and not loc.lower().startswith(q)]
    return LocalitySearchResponse(localities=(starts + contains)[: params.limit])


# ---------------------------------------------------------------------------
# 2. Recommend all properties within radius_km of locality
# ---------------------------------------------------------------------------
@router.get("/api/recommend", response_model=RecommendResponse)
def recommend_by_locality(params: Annotated[RecommendParams, Query()]):
    key = _resolve_locality(params.locality)

    distances_m = location_df[key]
    mask = (distances_m <= params.radius_km * 1000.0) & (distances_m < MISSING_DISTANCE)
    within = distances_m[mask].sort_values()

    properties = [
        NearbyPropertyCard(**_base_card(str(name)), distance_km=round(float(dist) / 1000.0, 2))
        for name, dist in within.items()
    ]
    return RecommendResponse(
        locality=key,
        radius_km=params.radius_km,
        count=len(properties),
        properties=properties,
    )


@router.post("/api/recommend", response_model=RecommendResponse)
def recommend_by_locality_post(params: RecommendParams):
    return recommend_by_locality(params)


# ---------------------------------------------------------------------------
# 3. Top-10 similar properties when user clicks a property name button
# ---------------------------------------------------------------------------
@router.get("/api/similar", response_model=SimilarResponse)
def similar_properties(params: Annotated[SimilarParams, Query()]):
    pos = _resolve_property_pos(params.property_name)

    scores = COMBINED_SIM[pos]
    order = [int(i) for i in np.argsort(-scores) if i != pos][: params.top_n]

    recommendations = [
        SimilarPropertyCard(
            **_base_card(PROPERTY_NAMES[i]),
            similarity_score=round(float(scores[i]), 4),
        )
        for i in order
    ]
    return SimilarResponse(
        selected_property=PropertyCard(**_base_card(PROPERTY_NAMES[pos])),
        count=len(recommendations),
        recommendations=recommendations,
    )


@router.post("/api/similar", response_model=SimilarResponse)
def similar_properties_post(params: SimilarParams):
    return similar_properties(params)