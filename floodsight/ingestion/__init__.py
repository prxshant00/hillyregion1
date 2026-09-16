"""
Ingestion layer for FloodSight.
Contains modular adapters with standard interfaces for weather, terrain, satellite, and sensor data.
"""
from floodsight.ingestion.base import BaseAdapter, AdapterHealthStatus, IngestionResult

__all__ = ["BaseAdapter", "AdapterHealthStatus", "IngestionResult"]
