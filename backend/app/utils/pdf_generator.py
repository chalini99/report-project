import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_report_pdf(
    report_data: dict,
    lab_results: list[dict],
    health_tips: list[str],
) -> bytes:
    """Generate a PDF report from report data and return as bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("Medical Insight AI Report", styles["Title"]))
    story.append(Spacer(1, 12))

    # Patient Summary
    story.append(Paragraph("Patient Summary", styles["Heading2"]))
    story.append(Paragraph(report_data.get("patient_summary", ""), styles["Normal"]))
    story.append(Spacer(1, 12))

    # Clinical Summary
    story.append(Paragraph("Clinical Summary", styles["Heading2"]))
    story.append(Paragraph(report_data.get("clinical_summary", ""), styles["Normal"]))
    story.append(Spacer(1, 12))

    # Lab Analysis
    story.append(Paragraph("Lab Analysis", styles["Heading2"]))
    if lab_results:
        table_data = [["Test", "Value", "Status", "Normal Range"]]
        for result in lab_results:
            table_data.append([
                result.get("test", ""),
                str(result.get("value", "")),
                result.get("status", ""),
                result.get("normal_range", ""),
            ])

        table = Table(table_data, hAlign="LEFT")
        style_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]
        # Color-code status cells (column index 2, rows 1+)
        for i, result in enumerate(lab_results, start=1):
            status = result.get("status", "")
            if status == "Normal":
                cell_color = colors.lightgreen
            elif status == "Low":
                cell_color = colors.yellow
            else:  # High
                cell_color = colors.salmon
            style_cmds.append(("BACKGROUND", (2, i), (2, i), cell_color))

        table.setStyle(TableStyle(style_cmds))
        story.append(table)
    else:
        story.append(Paragraph("No lab results available.", styles["Normal"]))
    story.append(Spacer(1, 12))

    # Overall Health Status
    story.append(Paragraph("Overall Health Status", styles["Heading2"]))
    story.append(Paragraph(report_data.get("overall_health_status", ""), styles["Normal"]))
    story.append(Spacer(1, 12))

    # Health Tips
    story.append(Paragraph("Health Tips", styles["Heading2"]))
    if health_tips:
        for tip in health_tips:
            story.append(Paragraph(f"• {tip}", styles["Normal"]))
    else:
        story.append(Paragraph("No health tips available.", styles["Normal"]))

    doc.build(story)
    return buffer.getvalue()
