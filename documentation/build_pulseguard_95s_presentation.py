from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "documentation" / "PulseGuard_Code_Presentation.docx"

# file, short purpose, exact source fragment, what that fragment proves
ITEMS = [
    ("index.html", "shows safety choices", "Open drop tracker", "the homepage exposes the tracker"),
    ("fall-detection.html", "holds tracker controls", "Start tracker", "the user starts monitoring"),
    ("app.js", "runs detection and escalation", "const ARM_DELAY_S = 5;", "the sensor waits five seconds before arming"),
    ("auth.js", "controls accounts", 'const authDialog = document.querySelector("#auth-dialog");', "JavaScript selects the account dialog"),
    ("nav.js", "creates shared navigation", "const SITE = [", "all page links begin in one central structure"),
    ("sound.js", "handles ordinary interface audio", 'const SOUND_FILE = "click.mp3";', "click feedback stays separate from the warning alarm"),
    ("site.css", "defines shared visuals", "--bg: #101418;", "pages reuse one dark background token"),
    ("styles.css", "styles the homepage layout", ".choice-grid {", "the emergency choices use a dedicated grid"),
    ("about.html", "explains limits and privacy", "No breathing or pulse sensing.", "the site states a sensor limitation openly"),
    ("risk-zones.html", "demonstrates privacy-aware planning", "const MIN_CALLS = 5;", "small groups are hidden before a zone is drawn"),
    ("safewalk.html", "adds a timed check-in", "const GRACE_S = 300;", "late status includes a five-minute grace period"),
    ("shelters.html", "ranks nearby resources", "const NEAREST = 5;", "results are limited to five useful locations"),
    ("hazard.html", "merges nearby hazard reports", "const MERGE_M = 60;", "reports within sixty metres can become one issue"),
    ("script.js", "renders illustrative city data", "const CITIES = [", "the older dashboard reads from one defined dataset"),
]

def quote_for(path, fragment):
    lines = (ROOT / path).read_text(encoding="utf-8").splitlines()
    for number, line in enumerate(lines, 1):
        if fragment in line:
            return number, line.strip()
    raise ValueError(f"Missing fragment in {path}: {fragment}")

doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin = section.bottom_margin = Inches(.55)
section.left_margin = section.right_margin = Inches(.72)

styles = doc.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10)
styles["Normal"].font.color.rgb = RGBColor(32, 36, 40)
styles["Normal"].paragraph_format.space_after = Pt(5)
styles["Title"].font.name = "Georgia"
styles["Title"].font.size = Pt(25)
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
ppr = styles["Title"]._element.get_or_add_pPr()
for border in ppr.findall(qn("w:pBdr")):
    ppr.remove(border)

doc.add_paragraph("PulseGuard Code Presentation", style="Title")
doc.add_paragraph("Approximately one minute thirty five seconds")

spoken = []
for path, purpose, fragment, proof in ITEMS:
    number, exact = quote_for(path, fragment)
    text = f"{path} {purpose}. Line {number}, \"{fragment}\", shows that {proof}."
    spoken.append(text)
    p = doc.add_paragraph(style="List Bullet")
    p.add_run(path).bold = True
    p.add_run(text[len(path):])
    p.paragraph_format.keep_together = True
    p.paragraph_format.space_after = Pt(5)

word_count = sum(len(text.replace("—", " ").split()) for text in spoken)
note = doc.add_paragraph()
note.add_run("Timing  ").bold = True
note.add_run(f"{word_count} spoken words at about 170 words per minute.")

doc.core_properties.title = "PulseGuard Code Presentation"
doc.core_properties.subject = "Ninety five second code presentation with exact line references"
doc.core_properties.author = "PulseGuard Team"
doc.save(OUT)
print(OUT)
print(word_count)
