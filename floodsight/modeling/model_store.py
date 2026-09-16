"""
Model persistence and metadata store for FloodSight.
Ensures every deployed model artifact tracks training timestamp, temporal holdout window,
exact measured metrics, and explicit literature citations.
"""
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
import joblib
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ARTIFACT_DIR = ROOT_DIR / "artifacts"


class LiteratureBenchmark(BaseModel):
    study_name: str = "Yunnan Province Rainfall-Induced Landslide Random Forest Study"
    citation: str = "Cited in academic literature as benchmark precedent for 8-factor terrain-rainfall modeling; NOT our result"
    reported_accuracy: float = 0.906
    reported_roc_auc: float = 0.954
    context: str = "Evaluated on Yunnan regional catchment data; serving as feature schema design guide"


class MeasuredValidationMetrics(BaseModel):
    evaluation_window: str = "2025-06-01 to 2025-08-31 (Himachal Pradesh Monsoon Holdout)"
    validation_wards_count: int
    test_samples_count: int
    positive_events_count: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    pr_auc: float
    true_positives: int
    false_positives: int
    true_negatives: int
    false_negatives: int


class ModelMetadata(BaseModel):
    model_name: str = "FloodSight_RandomForest_v1"
    model_version: str = "1.0.0"
    trained_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    algorithm: str = "RandomForestClassifier(n_estimators=150, max_depth=10, class_weight='balanced')"
    features: list = Field(default_factory=list)
    feature_importances: Dict[str, float] = Field(default_factory=dict)
    training_window: str = "2022-06-01 to 2024-09-30 (Historical Himachal Pradesh baseline)"
    literature_benchmark: LiteratureBenchmark = Field(default_factory=LiteratureBenchmark)
    measured_validation_metrics: MeasuredValidationMetrics


class ModelStore:
    def __init__(self, artifact_dir: Path = ARTIFACT_DIR):
        self.artifact_dir = artifact_dir
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        self.model_file = self.artifact_dir / "floodsight_rf_v1.pkl"
        self.meta_file = self.artifact_dir / "model_metadata.json"

    def save(self, model: Any, metadata: ModelMetadata):
        joblib.dump(model, self.model_file)
        with open(self.meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata.model_dump(mode="json"), f, indent=2)

    def load_model(self) -> Optional[Any]:
        if self.model_file.exists():
            return joblib.load(self.model_file)
        return None

    def load_metadata(self) -> Optional[Dict[str, Any]]:
        if self.meta_file.exists():
            with open(self.meta_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

    def is_trained(self) -> bool:
        return self.model_file.exists() and self.meta_file.exists()
