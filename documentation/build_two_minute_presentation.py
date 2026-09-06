# Explain: Import docx import Document for document generation. Import docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT for document generation. Import docx.enum.text import WD_ALIGN_PARAGRAPH for document generation.
from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
# Explain: Import docx.oxml import OxmlElement for document generation. Import docx.oxml.ns import qn for document generation. Import docx.shared import Inches, Pt, RGBColor for document generation.
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

# Explain: Assign OUT from the value shown here. Assign script from the value shown here. Record a presentation value or source-reference entry.
OUT = r"C:\Users\rishi\Downloads\public_safety_hackathon_site\PulseGuard_Code_Presentation.docx"

script = [
    ("What the site does", "Safeguard is a small browser prototype for responding to a possible phone drop. The homepage keeps the main choices visible: open the drop tracker, call 911 in immediate danger, help another person, or contact SAMHSA for substance-use support. The language stays short because someone using a safety tool should not have to search through a sales pitch."),
    # Explain: Record a presentation value or source-reference entry.
    ("How the tracker works", "The user presses Start tracker, then app.js waits five seconds before it reads DeviceMotion data. This gives the person time to put the phone down. IMPACT_MS2 is set to 25, so a hard movement calls startDropAlarm. That function loops warning-alarm.mp3, displays a ten-second countdown, and keeps a large Stop button on screen."),
    ("Why the map comes second", "The site does not request location when the alarm begins. Only after the alarm stops does careDialog ask whether to open a map. If the user agrees, openNearbyCare requests browser geolocation and opens a Google Maps search for emergency medical services near the returned coordinates. It does not claim to identify or dispatch an EMT."),
    ("How the files fit together", "fall-detection.html supplies the Start tracker control, alarm overlay, audio element, and map dialog. app.js owns the five-second arming delay, sensor, alarm timer, Stop action, and geolocation behavior. nav.js makes the Drop tracker link visible on every page, while site.css keeps the interface plain and readable. sound.js handles ordinary clicks separately from the warning-alarm MP3."),
# Explain: End this collection of values. Assign examples from the value shown here. Record a presentation value or source-reference entry.
]

examples = [
    ("app.js", "const DROP_ALARM_S = 10;", "Defines the complete alarm duration."),
    # Explain: Record a presentation value or source-reference entry.
    ("app.js", "const ARM_DELAY_S = 5;", "Waits five seconds before motion monitoring begins."),
    ("app.js", 'if (key === "impact") startDropAlarm();', "Starts the alarm when the impact signal fires."),
    ("app.js", 'audio.pause(); audio.currentTime = 0;', "Stops and resets the MP3 immediately."),
    # Explain: Record a presentation value or source-reference entry.
    ("app.js", 'navigator.geolocation.getCurrentPosition(...)', "Requests location only from the later map action."),
    ("fall-detection.html", '<audio id="alarmSound" src="warning-alarm.mp3" loop>', "Connects the supplied warning MP3 to the alarm."),
    ("nav.js", 'label: "Drop tracker"', "Keeps the tracker visible in shared navigation."),
# Explain: End this collection of values. Assign doc from the value shown here. Assign section from the value shown here.
]

doc = Document()
section = doc.sections[0]
# Explain: Assign section.page_width, section.page_height from the value shown here. Assign section.top_margin from the value shown here. Assign section.left_margin from the value shown here.
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin = section.bottom_margin = Inches(.65)
section.left_margin = section.right_margin = Inches(.75)

# Explain: Assign styles from the value shown here. Set the font appearance for this text or style.
styles = doc.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10.5)
# Explain: Set the font appearance for this text or style. Set paragraph spacing or pagination behavior.
styles["Normal"].font.color.rgb = RGBColor(35, 39, 43)
styles["Normal"].paragraph_format.space_after = Pt(5)
styles["Title"].font.name = "Georgia"
# Explain: Set the font appearance for this text or style. Set paragraph spacing or pagination behavior.
styles["Title"].font.size = Pt(27)
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
styles["Title"].paragraph_format.space_after = Pt(5)
# Explain: Assign title_ppr from the value shown here. Repeat the following work for border in title_ppr.findall(qn("w:pBdr")). Apply title_ppr.remove(border) in the document-building sequence.
title_ppr = styles["Title"]._element.get_or_add_pPr()
for border in title_ppr.findall(qn("w:pBdr")):
    title_ppr.remove(border)
# Explain: Repeat the following work for name in ("Heading 1", "Heading 2"). Set the font appearance for this text or style.
for name in ("Heading 1", "Heading 2"):
    styles[name].font.name = "Georgia"
    styles[name].font.color.rgb = RGBColor(0, 0, 0)
    # Explain: Set the font appearance for this text or style.
    styles[name].font.bold = False
styles["Heading 1"].font.size = Pt(17)
styles["Heading 2"].font.size = Pt(13)

# Explain: Add the specified content or structure to the Word document. Set the font appearance for this text or style.
doc.add_paragraph("Safeguard Two Minute Code Presentation", style="Title")
p = doc.add_paragraph("Presenter script  Approximately 245 words")
p.runs[0].font.color.rgb = RGBColor(90, 94, 99)

# Explain: Repeat the following work for heading, body in script. Add the specified content or structure to the Word document.
for heading, body in script:
    doc.add_heading(heading, level=2)
    p = doc.add_paragraph(body)
    # Explain: Set paragraph spacing or pagination behavior. Add the specified content or structure to the Word document.
    p.paragraph_format.line_spacing = 1.08

doc.add_heading("Code examples for questions", level=1)
table = doc.add_table(rows=1, cols=3)
# Explain: Assign table.autofit from the value shown here. Assign column_widths from the value shown here. Repeat the following work for column, width in zip(table.columns, column_widths).
table.autofit = False
column_widths = [Inches(1.05), Inches(3.15), Inches(2.65)]
for column, width in zip(table.columns, column_widths):
    # Explain: Assign column.width from the value shown here. Assign headers from the value shown here. Repeat the following work for i, text in enumerate(headers).
    column.width = width
headers = ["File", "Example", "Meaning"]
for i, text in enumerate(headers):
    # Explain: Assign cell from the value shown here. Assign cell.text from the value shown here. Create a Word XML element for detailed formatting.
    cell = table.rows[0].cells[i]
    cell.text = text
    shade = OxmlElement("w:shd")
    # Explain: Set a Word XML attribute controlling document formatting. Apply cell._tc.get_or_add_tcPr().append(shade) in the document-building sequence. Repeat the following work for run in cell.paragraphs[0].runs.
    shade.set(qn("w:fill"), "374151")
    cell._tc.get_or_add_tcPr().append(shade)
    for run in cell.paragraphs[0].runs:
        # Explain: Set the font appearance for this text or style. Repeat the following work for row_index, row in enumerate(examples).
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

for row_index, row in enumerate(examples):
    # Explain: Assign cells from the value shown here. Repeat the following work for i, text in enumerate(row). Assign cells[i].text from the value shown here.
    cells = table.add_row().cells
    for i, text in enumerate(row):
        cells[i].text = text
        # Explain: Assign cells[i].vertical_alignment from the value shown here. Run the following block when row_index % 2. Create a Word XML element for detailed formatting.
        cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        if row_index % 2:
            shade = OxmlElement("w:shd")
            # Explain: Set a Word XML attribute controlling document formatting. Apply cells[i]._tc.get_or_add_tcPr().append(shade) in the document-building sequence. Repeat the following work for run in cells[i].paragraphs[0].runs.
            shade.set(qn("w:fill"), "F3F4F6")
            cells[i]._tc.get_or_add_tcPr().append(shade)
        for run in cells[i].paragraphs[0].runs:
            # Explain: Set the font appearance for this text or style. Run the following block when i == 1.
            run.font.size = Pt(8.8)
            if i == 1:
                run.font.name = "Consolas"

# Explain: Repeat the following work for row in table.rows. Repeat the following work for cell_index, cell in enumerate(row.cells). Assign cell.width from the value shown here.
for row in table.rows:
    for cell_index, cell in enumerate(row.cells):
        cell.width = column_widths[cell_index]
        # Explain: Assign tc_pr from the value shown here. Assign borders from the value shown here. Run the following block when borders is None.
        tc_pr = cell._tc.get_or_add_tcPr()
        borders = tc_pr.first_child_found_in("w:tcBorders")
        if borders is None:
            # Explain: Create a Word XML element for detailed formatting. Apply tc_pr.append(borders) in the document-building sequence. Repeat the following work for edge in ("top", "left", "bottom", "right", "insideH", "insideV").
            borders = OxmlElement("w:tcBorders")
            tc_pr.append(borders)
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            # Explain: Create a Word XML element for detailed formatting. Set a Word XML attribute controlling document formatting.
            tag = OxmlElement(f"w:{edge}")
            tag.set(qn("w:val"), "single")
            tag.set(qn("w:sz"), "4")
            # Explain: Set a Word XML attribute controlling document formatting. Apply borders.append(tag) in the document-building sequence. Add the specified content or structure to the Word document.
            tag.set(qn("w:color"), "D9D9D9")
            borders.append(tag)

note = doc.add_paragraph()
# Explain: Assign note.add_run("Safety boundary ").bold from the value shown here. Apply note.add_run("This is a browser demonstration. It cannot dispatch responders, moni... in the document-building sequence. Assign doc.core_properties.title from the value shown here.
note.add_run("Safety boundary  ").bold = True
note.add_run("This is a browser demonstration. It cannot dispatch responders, monitor in the background, or guarantee that a detected movement is an emergency.")

doc.core_properties.title = "Safeguard Two Minute Code Presentation"
# Explain: Assign doc.core_properties.subject from the value shown here. Assign doc.core_properties.author from the value shown here. Write the completed Word document to its output path.
doc.core_properties.subject = "Two minute explanation of the Safeguard phone drop tracker"
doc.core_properties.author = "Safeguard Team"
doc.save(OUT)
# Explain: Apply print(OUT) in the document-building sequence.
print(OUT)
