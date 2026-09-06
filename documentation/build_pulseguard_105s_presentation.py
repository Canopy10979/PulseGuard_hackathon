# Explain: Import docx import Document for document generation. Import docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT for document generation. Import docx.oxml import OxmlElement for document generation.
from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
# Explain: Import docx.oxml.ns import qn for document generation. Import docx.shared import Inches, Pt, RGBColor for document generation. Assign OUT from the value shown here.
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

OUT = r"C:\Users\rishi\Downloads\public_safety_hackathon_site\public_safety_hackathon_final\documentation\PulseGuard_Code_Presentation.docx"

# Explain: Assign talk from the value shown here. Record a presentation value or source-reference entry.
talk = [
    "PulseGuard addresses the prompt's main problem: someone may become unable to ask for help. Its homepage shows the drop tracker, 911, bystander, and substance-use choices. The tracker link appears at index.html line 32.",
    "The user starts monitoring from fall-detection.html line 64. app.js line 20 defines a five-second arming delay, giving the user time to set the phone down before motion readings begin.",
    # Explain: Record a presentation value or source-reference entry.
    "A hard movement creates an impact signal. app.js lines 75 and 80 call startDropAlarm. Line 19 sets the warning to ten seconds, while fall-detection.html line 143 loads the attached warning MP3 instead of the click sound.",
    "The alarm is a local warning, not an emergency dispatch. Stopping it pauses and resets the audio, then app.js line 114 opens the care prompt. This keeps a dropped phone from automatically contacting anyone, matching the prompt's false-alarm pulseguard.",
    "If the user chooses Open map, openNearbyCare begins at app.js line 117. It asks for browser location and searches for nearby emergency medical services. Location is requested after the alarm, not before it.",
    # Explain: Record a presentation value or source-reference entry. End this collection of values. Assign files from the value shown here.
    "The other files support the same idea. nav.js line 11 centralizes navigation, auth.js line 24 opens the prototype account dialog, and the CSS keeps controls readable. Supporting pages show response zones, nearby resources, check-ins, and hazards without claiming a diagnosis.",
]

files = [
    # Explain: Record a presentation value or source-reference entry.
    ("index.html", "Main safety choices and visible tracker", "line 32"),
    ("fall-detection.html", "Start control, alarm, Stop, care dialog, MP3", "lines 64, 133, 143"),
    ("app.js", "Arming delay, motion logic, alarm timer, map", "lines 19-20, 75-130"),
    # Explain: Record a presentation value or source-reference entry.
    ("nav.js", "Shared navigation and account links", "lines 11-24, 99-113"),
    ("auth.js", "Login and sign-up prototype dialog", "lines 5-42"),
    ("sound.js", "Quiet interface click feedback", "lines 8, 20-42"),
    # Explain: Record a presentation value or source-reference entry.
    ("site.css", "Shared controls, dialogs, focus, responsive rules", "lines 106-124, 889-904"),
    ("styles.css", "Homepage cards and responsive layout", "lines 613-644"),
    ("about.html", "Limits, privacy, and unsupported claims", "page structure"),
    # Explain: Record a presentation value or source-reference entry.
    ("risk-zones.html", "Privacy-thresholded planning map", "inline script"),
    ("safewalk.html", "Timed check-in and nearby-care search", "inline script"),
    ("shelters.html", "Nearby public-safety resources", "inline script"),
    # Explain: Record a presentation value or source-reference entry. End this collection of values.
    ("hazard.html", "Community hazard reporting and merging", "inline script"),
    ("script.js", "Legacy illustrative city-data renderer", "data and render functions"),
]

# Explain: Assign doc from the value shown here. Assign sec from the value shown here. Assign sec.page_width, sec.page_height from the value shown here.
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
# Explain: Assign sec.top_margin from the value shown here. Assign sec.left_margin from the value shown here. Assign styles from the value shown here.
sec.top_margin = sec.bottom_margin = Inches(.62)
sec.left_margin = sec.right_margin = Inches(.72)

styles = doc.styles
# Explain: Set the font appearance for this text or style.
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10.5)
styles["Normal"].font.color.rgb = RGBColor(32, 36, 40)
# Explain: Set paragraph spacing or pagination behavior. Set the font appearance for this text or style.
styles["Normal"].paragraph_format.space_after = Pt(5)
styles["Title"].font.name = "Georgia"
styles["Title"].font.size = Pt(26)
# Explain: Set the font appearance for this text or style. Assign ppr from the value shown here. Repeat the following work for border in ppr.findall(qn("w:pBdr")).
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
ppr = styles["Title"]._element.get_or_add_pPr()
for border in ppr.findall(qn("w:pBdr")):
    # Explain: Apply ppr.remove(border) in the document-building sequence. Repeat the following work for name, size in (("Heading 1", 17), ("Heading 2", 13)). Set the font appearance for this text or style.
    ppr.remove(border)
for name, size in (("Heading 1", 17), ("Heading 2", 13)):
    styles[name].font.name = "Georgia"
    # Explain: Set the font appearance for this text or style.
    styles[name].font.size = Pt(size)
    styles[name].font.bold = False
    styles[name].font.color.rgb = RGBColor(0, 0, 0)

# Explain: Add the specified content or structure to the Word document.
doc.add_paragraph("PulseGuard Code Presentation", style="Title")
doc.add_paragraph("One minute forty five second presenter notes")
doc.add_heading("Presentation bullets", level=1)
# Explain: Repeat the following work for text in talk. Add the specified content or structure to the Word document. Apply p.add_run(text) in the document-building sequence.
for text in talk:
    p = doc.add_paragraph(style="List Bullet")
    p.add_run(text)
    # Explain: Set paragraph spacing or pagination behavior. Assign count from the value shown here.
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.1

count = sum(len(item.replace("-", " ").split()) for item in talk)
# Explain: Add the specified content or structure to the Word document.
doc.add_paragraph(f"Spoken length  {count} words at roughly 123 words per minute")

doc.add_page_break()
doc.add_heading("Code file feature guide", level=1)
# Explain: Add the specified content or structure to the Word document. Assign table.autofit from the value shown here.
doc.add_paragraph("Short references for questions after the timed presentation.")
table = doc.add_table(rows=1, cols=3)
table.autofit = False
# Explain: Assign widths from the value shown here. Repeat the following work for i, text in enumerate(("File", "Feature", "Code reference")). Assign cell from the value shown here.
widths = [Inches(1.35), Inches(3.65), Inches(1.95)]
for i, text in enumerate(("File", "Feature", "Code reference")):
    cell = table.rows[0].cells[i]
    # Explain: Assign cell.text from the value shown here. Assign cell.width from the value shown here. Create a Word XML element for detailed formatting.
    cell.text = text
    cell.width = widths[i]
    shade = OxmlElement("w:shd")
    # Explain: Set a Word XML attribute controlling document formatting. Apply cell._tc.get_or_add_tcPr().append(shade) in the document-building sequence. Repeat the following work for run in cell.paragraphs[0].runs.
    shade.set(qn("w:fill"), "374151")
    cell._tc.get_or_add_tcPr().append(shade)
    for run in cell.paragraphs[0].runs:
        # Explain: Set the font appearance for this text or style.
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9)

# Explain: Repeat the following work for row_index, values in enumerate(files). Assign cells from the value shown here. Repeat the following work for i, value in enumerate(values).
for row_index, values in enumerate(files):
    cells = table.add_row().cells
    for i, value in enumerate(values):
        # Explain: Assign cells[i].text from the value shown here. Assign cells[i].width from the value shown here. Assign cells[i].vertical_alignment from the value shown here.
        cells[i].text = value
        cells[i].width = widths[i]
        cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        # Explain: Run the following block when row_index % 2. Create a Word XML element for detailed formatting. Set a Word XML attribute controlling document formatting.
        if row_index % 2:
            shade = OxmlElement("w:shd")
            shade.set(qn("w:fill"), "F3F4F6")
            # Explain: Apply cells[i]._tc.get_or_add_tcPr().append(shade) in the document-building sequence. Repeat the following work for run in cells[i].paragraphs[0].runs. Set the font appearance for this text or style.
            cells[i]._tc.get_or_add_tcPr().append(shade)
        for run in cells[i].paragraphs[0].runs:
            run.font.size = Pt(8.6)

# Explain: Repeat the following work for row in table.rows. Repeat the following work for cell in row.cells. Create a Word XML element for detailed formatting.
for row in table.rows:
    for cell in row.cells:
        borders = OxmlElement("w:tcBorders")
        # Explain: Repeat the following work for edge in ("top", "left", "bottom", "right", "insideH", "insideV"). Create a Word XML element for detailed formatting. Set a Word XML attribute controlling document formatting.
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            line = OxmlElement(f"w:{edge}")
            line.set(qn("w:val"), "single")
            # Explain: Set a Word XML attribute controlling document formatting. Apply borders.append(line) in the document-building sequence.
            line.set(qn("w:sz"), "4")
            line.set(qn("w:color"), "D9D9D9")
            borders.append(line)
        # Explain: Apply cell._tc.get_or_add_tcPr().append(borders) in the document-building sequence. Assign doc.core_properties.title from the value shown here. Assign doc.core_properties.subject from the value shown here.
        cell._tc.get_or_add_tcPr().append(borders)

doc.core_properties.title = "PulseGuard Code Presentation"
doc.core_properties.subject = "One minute forty five second code explanation with line references"
# Explain: Assign doc.core_properties.author from the value shown here. Write the completed Word document to its output path. Apply print(OUT) in the document-building sequence.
doc.core_properties.author = "PulseGuard Team"
doc.save(OUT)
print(OUT)
# Explain: Apply print(count) in the document-building sequence.
print(count)
