# Explain: Import pathlib import Path for document generation. Import docx import Document for document generation. Import docx.oxml.ns import qn for document generation.
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
# Explain: Import docx.shared import Inches, Pt, RGBColor for document generation. Assign ROOT from the value shown here. Assign OUT from the value shown here.
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "documentation" / "PulseGuard_Code_Presentation.docx"

# filename, feature, explanation, exact text used to locate the quoted line
# Explain: Assign ENTRIES from the value shown here. Record a presentation value or source-reference entry.
ENTRIES = [
    (".gitignore", "keeps machine-specific files and secrets out of GitHub", "This protects repository hygiene without affecting the website", ".env"),
    ("README.md", "explains how to run and evaluate the project", "This gives another developer enough context to open the prototype correctly", "# PulseGuard"),
    # Explain: Record a presentation value or source-reference entry.
    ("about.html", "states the prototype's limits, privacy model, and evidence boundaries", "This keeps the safety claim focused on warning patterns instead of diagnosis", "<h1>What Safeguard can—and cannot—do.</h1>"),
    ("app.js", "controls the five-second arming delay, drop alarm, sensors, and nearby-care prompt", "This file contains the main safety sequence rather than only changing page appearance", "const ARM_DELAY_S = 5;"),
    ("auth.js", "opens the prototype login and sign-up dialog", "The code makes the account interface interactive without pretending that a backend exists", "if (!authDialog.open) authDialog.showModal();"),
    # Explain: Record a presentation value or source-reference entry.
    ("fall-detection.html", "provides the tracker button, alarm panel, Stop control, map prompt, and audio element", "This markup is the visible structure that app.js updates", '<audio id="alarmSound" src="warning-alarm.mp3" preload="auto" loop></audio>'),
    ("hazard.html", "demonstrates community hazard reporting and duplicate merging", "It is a supporting public-safety experiment rather than the core drop tracker", "const MERGE_M = 60;"),
    ("index.html", "presents the main emergency choices and a visible route to the tracker", "This makes the primary working feature easy to find from the homepage", '<a class="primary-btn" href="fall-detection.html">Open drop tracker</a>'),
    # Explain: Record a presentation value or source-reference entry.
    ("nav.js", "builds one shared navigation menu for every page", "Centralizing the link list prevents different pages from showing inconsistent destinations", 'const SITE = ['),
    ("risk-zones.html", "maps privacy-thresholded response-planning zones", "The page explores community planning while avoiding a claim about individual emergencies", "const MIN_CALLS = 5;"),
    ("robots.txt", "allows search crawlers to access the public site", "This is the smallest site-wide SEO instruction in the repository", "Allow: /"),
    # Explain: Record a presentation value or source-reference entry.
    ("safewalk.html", "demonstrates a timed check-in and nearby emergency-care search", "It supports the broader goal of shortening the route to human help", "const GRACE_S = 300;"),
    ("script.js", "renders the older illustrative city-data dashboard", "Its data stays clearly separate from the live drop-tracker logic", "const CITIES = ["),
    ("shelters.html", "ranks nearby AED, shelter, and hydrant records", "This supporting page shows how location could surface practical safety resources", "const NEAREST = 5;"),
    # Explain: Record a presentation value or source-reference entry.
    ("site.css", "defines shared navigation, controls, dialogs, accessibility states, and mobile rules", "This keeps the interface consistent across all pages", ".care-dialog {"),
    ("sound.js", "plays optional quiet feedback for ordinary interface actions", "It deliberately uses click.mp3 separately from the loud warning alarm", 'const SOUND_FILE = "click.mp3";'),
    ("styles.css", "styles homepage choices and responsive layout", "The grid becomes one column on smaller screens so the safety actions remain readable", ".choice-grid {"),
    # Explain: Record a presentation value or source-reference entry.
    ("documentation/build_prompt_aligned_presentation.py", "generates the prompt-relevance version of the Word presentation", "Keeping the generator in GitHub makes that document reproducible", 'OUT = r"'),
    ("documentation/build_pulseguard_105s_presentation.py", "generates the earlier 105-second bullet presentation", "Its talk list stores the exact presenter wording before Word formatting is applied", "talk = ["),
    ("documentation/build_two_minute_presentation.py", "generates the two-minute code overview", "It records the intended output path and can rebuild the document after code changes", 'OUT = r"'),
    # Explain: Record a presentation value or source-reference entry. End this collection of values. Assign BINARY_ENTRIES from the value shown here.
    ("documentation/build_repo_file_bullets.py", "generates this repository-wide line-reference presentation", "It reads the current files to calculate line numbers instead of relying on stale manual references", "ENTRIES = ["),
]

BINARY_ENTRIES = [
    # Explain: Record a presentation value or source-reference entry.
    ("click.mp3", "contains the short sound used for ordinary interface feedback", "As a binary audio file, it has no readable source-code line number"),
    ("warning-alarm.mp3", "contains the loud warning recording used after a detected drop", "As a binary audio file, it has no readable source-code line number"),
    ("documentation/Safeguard_Prompt_Aligned_Code_Presentation.docx", "stores the earlier prompt-aligned presentation", "A DOCX is a packaged binary document, so it has pages and paragraphs rather than source lines"),
    # Explain: Record a presentation value or source-reference entry. End this collection of values.
    ("documentation/Safeguard_Two_Minute_Code_Presentation.docx", "stores the earlier two-minute presentation", "A DOCX is a packaged binary document, so it has pages and paragraphs rather than source lines"),
    ("documentation/PulseGuard_Code_Presentation.docx", "stores the current presentation deliverable", "A DOCX is a packaged binary document, so it has pages and paragraphs rather than source lines"),
]

# Explain: Define the helper locate. Assign lines from the value shown here. Repeat the following work for number, line in enumerate(lines, 1).
def locate(path, needle):
    lines = (ROOT / path).read_text(encoding="utf-8").splitlines()
    for number, line in enumerate(lines, 1):
        # Explain: Run the following block when needle in line. Return number, line.strip() to the caller. Apply raise ValueError(f"Could not find {needle!r} in {path}") in the document-building sequence.
        if needle in line:
            return number, line.strip()
    raise ValueError(f"Could not find {needle!r} in {path}")

# Explain: Assign doc from the value shown here. Assign section from the value shown here. Assign section.page_width, section.page_height from the value shown here.
doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
# Explain: Assign section.top_margin from the value shown here. Assign section.left_margin from the value shown here. Assign styles from the value shown here.
section.top_margin = section.bottom_margin = Inches(.55)
section.left_margin = section.right_margin = Inches(.78)

styles = doc.styles
# Explain: Set the font appearance for this text or style.
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10)
styles["Normal"].font.color.rgb = RGBColor(32, 36, 40)
# Explain: Set paragraph spacing or pagination behavior. Set the font appearance for this text or style.
styles["Normal"].paragraph_format.space_after = Pt(5)
styles["Title"].font.name = "Georgia"
styles["Title"].font.size = Pt(26)
# Explain: Set the font appearance for this text or style. Assign ppr from the value shown here. Repeat the following work for border in ppr.findall(qn("w:pBdr")).
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
ppr = styles["Title"]._element.get_or_add_pPr()
for border in ppr.findall(qn("w:pBdr")):
    # Explain: Apply ppr.remove(border) in the document-building sequence. Set the font appearance for this text or style.
    ppr.remove(border)
styles["Heading 1"].font.name = "Georgia"
styles["Heading 1"].font.size = Pt(17)
# Explain: Set the font appearance for this text or style. Add the specified content or structure to the Word document.
styles["Heading 1"].font.bold = False
styles["Heading 1"].font.color.rgb = RGBColor(0, 0, 0)

doc.add_paragraph("PulseGuard Repository File Presentation", style="Title")
# Explain: Add the specified content or structure to the Word document. Assign intro.add_run("How to use this document ").bold from the value shown here.
doc.add_paragraph("Two to three presentation sentences for every file tracked in GitHub")
intro = doc.add_paragraph()
intro.add_run("How to use this document  ").bold = True
# Explain: Apply intro.add_run("Each bullet identifies a file's feature, quotes an exact current li... in the document-building sequence. Add the specified content or structure to the Word document. Repeat the following work for path, feature, explanation, needle in ENTRIES.
intro.add_run("Each bullet identifies a file's feature, quotes an exact current line when the file is readable text, and explains what that line proves about the implementation.")

doc.add_heading("Source and configuration files", level=1)
for path, feature, explanation, needle in ENTRIES:
    # Explain: Assign number, exact from the value shown here. Add the specified content or structure to the Word document. Assign first from the value shown here.
    number, exact = locate(path, needle)
    p = doc.add_paragraph(style="List Bullet")
    first = p.add_run(path + ". ")
    # Explain: Assign first.bold from the value shown here. Apply p.add_run(f"This file {feature}. Line {number}, \"{exact}\", shows the exact code ... in the document-building sequence. Set paragraph spacing or pagination behavior.
    first.bold = True
    p.add_run(f"This file {feature}. Line {number}, \"{exact}\", shows the exact code used for that feature. {explanation}.")
    p.paragraph_format.keep_together = True

# Explain: Add the specified content or structure to the Word document. Repeat the following work for path, feature, explanation in BINARY_ENTRIES.
doc.add_heading("Binary files", level=1)
for path, feature, explanation in BINARY_ENTRIES:
    p = doc.add_paragraph(style="List Bullet")
    # Explain: Assign first from the value shown here. Assign first.bold from the value shown here. Apply p.add_run(f"This file {feature}. {explanation}.") in the document-building sequence.
    first = p.add_run(path + ". ")
    first.bold = True
    p.add_run(f"This file {feature}. {explanation}.")
    # Explain: Set paragraph spacing or pagination behavior. Assign doc.core_properties.title from the value shown here. Assign doc.core_properties.subject from the value shown here.
    p.paragraph_format.keep_together = True

doc.core_properties.title = "PulseGuard Repository File Presentation"
doc.core_properties.subject = "Exact code-line explanations for every file in the GitHub repository"
# Explain: Assign doc.core_properties.author from the value shown here. Write the completed Word document to its output path. Apply print(OUT) in the document-building sequence.
doc.core_properties.author = "PulseGuard Team"
doc.save(OUT)
print(OUT)
