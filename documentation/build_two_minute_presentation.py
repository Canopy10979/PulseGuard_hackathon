from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

OUT = r"C:\Users\rishi\Downloads\public_safety_hackathon_site\PulseGuard_Code_Presentation.docx"

script = [
    ("What the site does", "Lifeline is a small browser prototype for responding to a possible phone drop. The homepage keeps the main choices visible: open the drop tracker, call 911 in immediate danger, help another person, or contact SAMHSA for substance-use support. The language stays short because someone using a safety tool should not have to search through a sales pitch."),
    ("How the tracker works", "The tracker reads DeviceMotion data only after the user turns it on. In app.js, IMPACT_MS2 is set to 25, so a hard movement calls startDropAlarm. That function plays click.mp3 on a loop, displays a ten-second countdown, and keeps a large Stop button on screen. stopDropAlarm always pauses and rewinds the audio before showing the next choice."),
    ("Why the map comes second", "The site does not request location when the alarm begins. Only after the alarm stops does careDialog ask whether to open a map. If the user agrees, openNearbyCare requests browser geolocation and opens a Google Maps search for emergency medical services near the returned coordinates. It does not claim to identify or dispatch an EMT."),
    ("How the files fit together", "fall-detection.html supplies the sensor switch, alarm overlay, audio element, and map dialog. app.js owns the sensor, timer, Stop, and geolocation behavior. nav.js makes the Drop tracker link visible on every page, while site.css keeps the interface plain, readable, responsive, and keyboard-friendly. sound.js handles ordinary interface feedback separately from the ten-second alarm, and auth.js keeps the prototype login and sign-up controls honest by sending and saving nothing."),
]

examples = [
    ("app.js", "const DROP_ALARM_S = 10;", "Defines the complete alarm duration."),
    ("app.js", 'if (key === "impact") startDropAlarm();', "Starts the alarm when the impact signal fires."),
    ("app.js", 'audio.pause(); audio.currentTime = 0;', "Stops and resets the MP3 immediately."),
    ("app.js", 'navigator.geolocation.getCurrentPosition(...)', "Requests location only from the later map action."),
    ("fall-detection.html", '<audio id="alarmSound" src="click.mp3" loop>', "Connects the supplied MP3 to the alarm."),
    ("nav.js", 'label: "Drop tracker"', "Keeps the tracker visible in shared navigation."),
]

doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin = section.bottom_margin = Inches(.65)
section.left_margin = section.right_margin = Inches(.75)

styles = doc.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10.5)
styles["Normal"].font.color.rgb = RGBColor(35, 39, 43)
styles["Normal"].paragraph_format.space_after = Pt(5)
styles["Title"].font.name = "Georgia"
styles["Title"].font.size = Pt(27)
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
styles["Title"].paragraph_format.space_after = Pt(5)
title_ppr = styles["Title"]._element.get_or_add_pPr()
for border in title_ppr.findall(qn("w:pBdr")):
    title_ppr.remove(border)
for name in ("Heading 1", "Heading 2"):
    styles[name].font.name = "Georgia"
    styles[name].font.color.rgb = RGBColor(0, 0, 0)
    styles[name].font.bold = False
styles["Heading 1"].font.size = Pt(17)
styles["Heading 2"].font.size = Pt(13)

doc.add_paragraph("Lifeline Two Minute Code Presentation", style="Title")
p = doc.add_paragraph("Presenter script  Approximately 245 words")
p.runs[0].font.color.rgb = RGBColor(90, 94, 99)

for heading, body in script:
    doc.add_heading(heading, level=2)
    p = doc.add_paragraph(body)
    p.paragraph_format.line_spacing = 1.08

doc.add_heading("Code examples for questions", level=1)
table = doc.add_table(rows=1, cols=3)
table.autofit = False
column_widths = [Inches(1.05), Inches(3.15), Inches(2.65)]
for column, width in zip(table.columns, column_widths):
    column.width = width
headers = ["File", "Example", "Meaning"]
for i, text in enumerate(headers):
    cell = table.rows[0].cells[i]
    cell.text = text
    shade = OxmlElement("w:shd")
    shade.set(qn("w:fill"), "374151")
    cell._tc.get_or_add_tcPr().append(shade)
    for run in cell.paragraphs[0].runs:
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

for row_index, row in enumerate(examples):
    cells = table.add_row().cells
    for i, text in enumerate(row):
        cells[i].text = text
        cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        if row_index % 2:
            shade = OxmlElement("w:shd")
            shade.set(qn("w:fill"), "F3F4F6")
            cells[i]._tc.get_or_add_tcPr().append(shade)
        for run in cells[i].paragraphs[0].runs:
            run.font.size = Pt(8.8)
            if i == 1:
                run.font.name = "Consolas"

for row in table.rows:
    for cell_index, cell in enumerate(row.cells):
        cell.width = column_widths[cell_index]
        tc_pr = cell._tc.get_or_add_tcPr()
        borders = tc_pr.first_child_found_in("w:tcBorders")
        if borders is None:
            borders = OxmlElement("w:tcBorders")
            tc_pr.append(borders)
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            tag = OxmlElement(f"w:{edge}")
            tag.set(qn("w:val"), "single")
            tag.set(qn("w:sz"), "4")
            tag.set(qn("w:color"), "D9D9D9")
            borders.append(tag)

note = doc.add_paragraph()
note.add_run("Safety boundary  ").bold = True
note.add_run("This is a browser demonstration. It cannot dispatch responders, monitor in the background, or guarantee that a detected movement is an emergency.")

doc.core_properties.title = "Lifeline Two Minute Code Presentation"
doc.core_properties.subject = "Two minute explanation of the Lifeline phone drop tracker"
doc.core_properties.author = "Lifeline Team"
doc.save(OUT)
print(OUT)
