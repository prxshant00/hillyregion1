"""
Notification and Alert Dispatching module for FloodSight.
Supports Twilio SMS and local Console/Mock providers via a common interface.
"""
from floodsight.messaging.provider import BaseNotificationProvider, AlertDispatchRecord

__all__ = ["BaseNotificationProvider", "AlertDispatchRecord"]
