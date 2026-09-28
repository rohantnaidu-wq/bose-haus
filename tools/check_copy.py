"""Copy linter: banned words, emoji and exclamation marks.

Usage:  python tools/check_copy.py [src/content.js] [dist/*.html ...]
Checks every string in content.js, plus the visible text of any HTML files given.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import bh  # noqa: E402

BANNED = [
    "nestled", "hidden gem", "oasis", "elevate", "curated", "unwind and recharge", "boasts",
    "tapestry", "sanctuary", "discover the magic", "illness", "hospital", "patient",
    "treatment", "luxury", "only 1 left", "hurry", "book now before",
]
WHETHER = re.compile(r"whether you'?re\b.*?\bor\b", re.I)
EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿️‍]")


def walk(node, path=""):
    if isinstance(node, str):
        yield path, node
    elif isinstance(node, dict):
        for k, v in node.items():
            yield from walk(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, f"{path}[{i}]")


class _Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip, self.parts = 0, []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        for name, value in attrs:  # alt, aria-label, title and placeholder are copy too
            if name in ("alt", "aria-label", "title", "placeholder", "content") and value:
                self.parts.append(value)

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.parts.append(data)


def problems(label, text):
    low = text.lower()
    for word in BANNED:
        if re.search(r"\b" + re.escape(word) + r"\b", low):
            yield f"{label}: banned phrase '{word}'"
    if WHETHER.search(text):
        yield f"{label}: \"whether you're ... or ...\""
    if "!" in text:
        yield f"{label}: exclamation mark"
    if EMOJI.search(text):
        yield f"{label}: emoji"


def main(args):
    targets = args or [str(bh.ROOT / "src" / "content.js")]
    found = []
    for t in targets:
        p = Path(t)
        if p.suffix == ".js":
            for key, text in walk(bh.read_content(p)):
                found += problems(f"{p.name} {key}", text)
        else:
            tp = _Text()
            tp.feed(p.read_text(encoding="utf-8"))
            for text in tp.parts:
                found += problems(f"{p.name} \"{text.strip()[:50]}\"", text)
    for f in found:
        print("FAIL", f)
    print(f"check_copy: {'PASS' if not found else 'FAIL'} ({len(targets)} file(s), {len(found)} problem(s))")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
