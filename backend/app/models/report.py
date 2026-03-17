from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base
from sqlalchemy import Column, String

file_path = Column(String, nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    filename = Column(String, nullable=False)
    patient_summary = Column(String, nullable=False)
    clinical_summary = Column(String, nullable=False)
    overall_health_status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
