# Explain: Import docx import Document for document generation. Import docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT for document generation. Import docx.oxml import OxmlElement for document generation.
from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
# Explain: Import docx.oxml.ns import qn for document generation. Import docx.shared import Inches, Pt, RGBColor for document generation. Assign OUT from the value shown here.
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

OUT = r"C:\Users\rishi\Downloads\public_safety_hackathon_site\public_safety_hackathon_final\documentation\PulseGuard_Prompt_Aligned_Code_Presentation.docx"

# Explain: Assign script from the value shown here. Record a presentation value or source-reference entry.
script = (
    "PulseGuard responds to the main prompt's central problem: a person may become unable to ask for help. "
    "The homepage offers immediate 911, bystander, substance-use, and drop-tracker choices without claiming to diagnose an overdose. "
    # Explain: Record a presentation value or source-reference entry.
    "The tracker waits five seconds after Start so the user can place the phone, then reads motion data. A hard drop plays the attached warning alarm for ten seconds or until Stop is pressed. "
    "This audible alarm is only a local check, not an emergency call, so a dropped phone alone still does not contact anyone. After the alarm ends, the site asks whether to open a nearby emergency-care map and requests location only if the user agrees. "
    "The broader collapse logic still records impact, orientation, stillness, responsiveness, and location as separate signals. That reflects the prompt's false-alarm rule that stronger action should rely on more than one warning sign. "
    # Explain: Record a presentation value or source-reference entry. End this collection of values.
    "The HTML files provide the public pages and controls. app.js owns sensor, alarm, timer, contact, and location behavior; nav.js makes the tracker visible everywhere; auth.js keeps prototype accounts honest; and the two CSS files provide a restrained accessible layout. "
    "The remaining pages demonstrate privacy-aware response zones, nearby resources, timed check-ins, and community reports. Together, the code represents a transparent hackathon prototype designed to recognize danger, verify the situation, and shorten the path to human help."
)

# Explain: Assign files from the value shown here. Record a presentation value or source-reference entry.
files = [
    ("index.html", "Human entry points, 911 and bystander actions, SAMHSA helpline, visible tracker link", "Manual and bystander modes; fast help without diagnosis"),
    ("fall-detection.html", "Start tracker, alarm overlay, Stop control, contact and map dialogs", "Automatic detection, loud alarm, cancel control, emergency context"),
    # Explain: Record a presentation value or source-reference entry.
    ("app.js", "Five-second arming, motion thresholds, ten-second MP3 alarm, multi-signal scoring, geolocation", "Detection, false-alarm protection, responsiveness, location sharing"),
    ("auth.js", "Prototype login and sign-up dialog without sending or saving credentials", "Supports future setup while remaining honest about unfinished services"),
    ("nav.js", "Shared navigation, active-page state, visible Drop tracker link", "Makes monitoring easy to find and status paths consistent"),
    # Explain: Record a presentation value or source-reference entry.
    ("sound.js", "Optional quiet interface feedback and remembered mute preference", "Separates ordinary clicks from the emergency warning alarm"),
    ("site.css", "Shared typography, controls, dialogs, focus states, and responsive rules", "Keeps high-stress actions readable and accessible"),
    ("styles.css", "Homepage layout, emergency cards, sequence, account dialog", "Presents manual and bystander choices with minimal text"),
    # Explain: Record a presentation value or source-reference entry.
    ("about.html", "Working features, limitations, privacy, and unsupported claims", "Reinforces that PulseGuard detects risk patterns, not substances"),
    ("risk-zones.html", "Privacy-thresholded response-planning map", "Supports community response without exposing individual events"),
    ("safewalk.html", "Timed check-in and nearby emergency-care search", "Demonstrates human follow-up and location-assisted help"),
    # Explain: Record a presentation value or source-reference entry.
    ("shelters.html", "Nearby naloxones, shelter, and hydrant resource ranking", "Shortens the path to practical public-safety resources"),
    ("hazard.html", "Local hazard reports, map display, and duplicate merging", "Shows a supporting community-safety reporting pattern"),
    ("script.js", "Legacy illustrative city metrics and safe DOM rendering", "Keeps experimental data clearly separate from verified claims"),
# Explain: End this collection of values. Assign doc from the value shown here. Assign sec from the value shown here.
]

doc = Document()
sec = doc.sections[0]
# Explain: Assign sec.page_width, sec.page_height from the value shown here. Assign sec.top_margin from the value shown here. Assign sec.left_margin from the value shown here.
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin = sec.bottom_margin = Inches(.65)
sec.left_margin = sec.right_margin = Inches(.72)

# Explain: Assign styles from the value shown here. Set the font appearance for this text or style.
styles = doc.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10.5)
# Explain: Set the font appearance for this text or style. Set paragraph spacing or pagination behavior.
styles["Normal"].font.color.rgb = RGBColor(35, 39, 43)
styles["Normal"].paragraph_format.space_after = Pt(6)
styles["Title"].font.name = "Georgia"
# Explain: Set the font appearance for this text or style. Assign title_ppr from the value shown here.
styles["Title"].font.size = Pt(25)
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
title_ppr = styles["Title"]._element.get_or_add_pPr()
# Explain: Repeat the following work for border in title_ppr.findall(qn("w:pBdr")). Apply title_ppr.remove(border) in the document-building sequence. Repeat the following work for name, size in (("Heading 1", 17), ("Heading 2", 13)).
for border in title_ppr.findall(qn("w:pBdr")):
    title_ppr.remove(border)
for name, size in (("Heading 1", 17), ("Heading 2", 13)):
    # Explain: Set the font appearance for this text or style.
    styles[name].font.name = "Georgia"
    styles[name].font.size = Pt(size)
    styles[name].font.bold = False
    # Explain: Set the font appearance for this text or style. Add the specified content or structure to the Word document.
    styles[name].font.color.rgb = RGBColor(0, 0, 0)

doc.add_paragraph("PulseGuard Code and Prompt Relevance", style="Title")
doc.add_paragraph("Two minute presentation script and file feature guide")
# Explain: Add the specified content or structure to the Word document. Set paragraph spacing or pagination behavior.
doc.add_heading("Presenter script", level=1)
p = doc.add_paragraph(script)
p.paragraph_format.line_spacing = 1.12
# Explain: Add the specified content or structure to the Word document.
doc.add_paragraph("Spoken length  Approximately 235 words")

doc.add_page_break()
doc.add_heading("Features by code file", level=1)
# Explain: Add the specified content or structure to the Word document. Assign table.autofit from the value shown here.
doc.add_paragraph("Use this page for follow-up questions after the two-minute script.")
table = doc.add_table(rows=1, cols=3)
table.autofit = False
# Explain: Assign widths from the value shown here. Assign headers from the value shown here. Repeat the following work for i, text in enumerate(headers).
widths = [Inches(1.25), Inches(3.15), Inches(2.55)]
headers = ["File", "Main feature", "Relevance to the project prompt"]
for i, text in enumerate(headers):
    # Explain: Assign cell from the value shown here. Assign cell.text from the value shown here. Assign cell.width from the value shown here.
    cell = table.rows[0].cells[i]
    cell.text = text
    cell.width = widths[i]
    # Explain: Create a Word XML element for detailed formatting. Set a Word XML attribute controlling document formatting. Apply cell._tc.get_or_add_tcPr().append(shade) in the document-building sequence.
    shade = OxmlElement("w:shd")
    shade.set(qn("w:fill"), "374151")
    cell._tc.get_or_add_tcPr().append(shade)
    # Explain: Repeat the following work for run in cell.paragraphs[0].runs. Set the font appearance for this text or style.
    for run in cell.paragraphs[0].runs:
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        # Explain: Set the font appearance for this text or style. Repeat the following work for row_index, values in enumerate(files). Assign cells from the value shown here.
        run.font.size = Pt(8.7)

for row_index, values in enumerate(files):
    cells = table.add_row().cells
    # Explain: Repeat the following work for i, text in enumerate(values). Assign cells[i].text from the value shown here. Assign cells[i].width from the value shown here.
    for i, text in enumerate(values):
        cells[i].text = text
        cells[i].width = widths[i]
        # Explain: Assign cells[i].vertical_alignment from the value shown here. Run the following block when row_index % 2. Create a Word XML element for detailed formatting.
        cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        if row_index % 2:
            shade = OxmlElement("w:shd")
            # Explain: Set a Word XML attribute controlling document formatting. Apply cells[i]._tc.get_or_add_tcPr().append(shade) in the document-building sequence. Repeat the following work for run in cells[i].paragraphs[0].runs.
            shade.set(qn("w:fill"), "F3F4F6")
            cells[i]._tc.get_or_add_tcPr().append(shade)
        for run in cells[i].paragraphs[0].runs:
            # Explain: Set the font appearance for this text or style. Repeat the following work for row in table.rows. Repeat the following work for cell in row.cells.
            run.font.size = Pt(8.1)

for row in table.rows:
    for cell in row.cells:
        # Explain: Assign cell.margin_top from the value shown here. Assign tc_pr from the value shown here. Create a Word XML element for detailed formatting.
        cell.margin_top = cell.margin_bottom = Inches(.03)
        tc_pr = cell._tc.get_or_add_tcPr()
        borders = OxmlElement("w:tcBorders")
        # Explain: Repeat the following work for edge in ("top", "left", "bottom", "right", "insideH", "insideV"). Create a Word XML element for detailed formatting. Set a Word XML attribute controlling document formatting.
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            line = OxmlElement(f"w:{edge}")
            line.set(qn("w:val"), "single")
            # Explain: Set a Word XML attribute controlling document formatting. Apply borders.append(line) in the document-building sequence.
            line.set(qn("w:sz"), "4")
            line.set(qn("w:color"), "D9D9D9")
            borders.append(line)
        # Explain: Apply tc_pr.append(borders) in the document-building sequence. Assign doc.core_properties.title from the value shown here. Assign doc.core_properties.subject from the value shown here.
        tc_pr.append(borders)

doc.core_properties.title = "PulseGuard Code and Prompt Relevance"
doc.core_properties.subject = "Two minute presentation and code file feature guide"
# Explain: Assign doc.core_properties.author from the value shown here. Write the completed Word document to its output path. Apply print(OUT) in the document-building sequence.
doc.core_properties.author = "PulseGuard Team"
doc.save(OUT)
print(OUT)
