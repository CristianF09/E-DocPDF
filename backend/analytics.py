from datetime import datetime, timedelta
from typing import Dict
from collections import defaultdict

class AnalyticsEngine:
    def __init__(self):
        self.events = []
    
    def track_event(self, event_type: str, user_id: str, metadata: Dict = None):
        event = {
            "event_type": event_type,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        self.events.append(event)
    
    def get_user_stats(self, user_id: str) -> Dict:
        user_events = [e for e in self.events if e["user_id"] == user_id]
        return {
            "total_events": len(user_events),
            "event_types": list(set(e["event_type"] for e in user_events)),
            "last_activity": max((e["timestamp"] for e in user_events), default=None)
        }
    
    def get_document_stats(self, user_id: str) -> Dict:
        doc_events = [e for e in self.events if e["user_id"] == user_id and e["event_type"] == "document"]
        return {
            "total_documents": len(doc_events),
            "operations": defaultdict(int)
        }
    
    def get_daily_activity(self, days: int = 7) -> Dict:
        cutoff = datetime.utcnow() - timedelta(days=days)
        recent_events = [
            e for e in self.events 
            if datetime.fromisoformat(e["timestamp"]) >= cutoff
        ]
        daily_counts = defaultdict(int)
        for e in recent_events:
            date = e["timestamp"].split("T")[0]
            daily_counts[date] += 1
        return dict(daily_counts)

analytics = AnalyticsEngine()