from pathlib import Path
import re
import json

root = Path(__file__).resolve().parent.parent
text = (root / 'content/field-guide.md').read_text()
chapters = []
for section in re.split(r'^## ', text, flags=re.M)[1:]:
    header, body = section.split('\n', 1)
    number, slug, title = [x.strip() for x in header.split('|')]
    deck = re.search(r'^> (.+)$', body, re.M).group(1)
    refs = re.search(r'^Sources: (.+)$', body, re.M).group(1).split(', ')
    prose = re.sub(r'^(> |Sources: ).*\n?', '', body, flags=re.M).strip()
    chapters.append(dict(number=number, slug=slug, title=title, deck=deck,
                         sourceIds=refs, paragraphs=[p.strip() for p in prose.split('\n\n') if p.strip()]))
(root / 'content/chapters.json').write_text(json.dumps(chapters, ensure_ascii=False, indent=2) + '\n')
print(f'Compiled {len(chapters)} chapters')
