from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.models.report import Report
from app.utils.pdf_generator import generate_report_pdf

router = APIRouter()


# ✅ GET ALL REPORTS
@router.get("/api/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "filename": r.filename,
            "patient_summary": r.patient_summary,
            "clinical_summary": r.clinical_summary,
            "overall_health_status": r.overall_health_status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


# 🔥 DOWNLOAD ORIGINAL UPLOADED FILE (MAIN FEATURE)
@router.get("/api/reports/{report_id}/download-original")
def download_original(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.file_path:
        raise HTTPException(status_code=404, detail="File path not stored")

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="File missing on server")

    return FileResponse(
        path=report.file_path,
        filename=report.filename,
        media_type="application/pdf"
    )


# 🔥 DOWNLOAD AI GENERATED REPORT (OPTIONAL)
@router.get("/api/reports/{report_id}/download-ai")
def download_ai_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report_data = {
        "filename": report.filename,
        "patient_summary": report.patient_summary,
        "clinical_summary": report.clinical_summary,
        "overall_health_status": report.overall_health_status,
    }

    pdf_bytes = generate_report_pdf(
        report_data=report_data,
        lab_results=[],
        health_tips=[],
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=ai_report_{report_id}.pdf"
        },
    )