"""Image integrity check. The worst error is a photo of the wrong room on the wrong page.

Usage:  python tools/check_images.py . dist/index.html [dist/cottage.html ...]

Rules, for every <img>, <video> and element carrying data-img:
 1. data-img must name an entry in image-manifest.json (photos or generated).
 2. A photo must sit inside a data-space wrapper whose value matches the photo's space,
    and must not be a held photo.
 3. A generated asset must sit inside (or carry) data-kind="motion|illustration|texture".
 4. Every <img> needs alt text (alt="" is allowed only for decorative generated assets).
"""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path

VOID = {"img", "source", "meta", "link", "br", "hr", "input", "wbr", "track", "area", "col", "embed", "param"}
KINDS = {"motion", "illustration", "texture"}


class Checker(HTMLParser):
    def __init__(self, manifest, name):
        super().__init__()
        self.m, self.name = manifest, name
        self.stack, self.errors, self.count = [], [], 0

    def nearest(self, attr, own):
        if attr in own:
            return own[attr]
        for _, a in reversed(self.stack):
            if attr in a:
                return a[attr]
        return None

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag in ("img", "video") or "data-img" in a:
            self.check(tag, a)
        if tag not in VOID:
            self.stack.append((tag, a))

    def handle_startendtag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag in ("img", "video") or "data-img" in a:
            self.check(tag, a)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def err(self, msg):
        line = self.getpos()[0]
        self.errors.append(f"{self.name}:{line}: {msg}")

    def check(self, tag, a):
        key = a.get("data-img")
        if not key and not a.get("src") and not a.get("data-src"):
            return  # empty slot filled at runtime (the lightbox); site.js tags it with data-img
        self.count += 1
        if not key:
            return self.err(f"<{tag}> without data-img")
        photos, gen, held = self.m["photos"], self.m.get("generated", {}), self.m.get("held", {})
        if key in photos:
            if key in held:
                self.err(f"{key} is held (duplicate photo, space not confirmed)")
            space = self.nearest("data-space", a)
            if space != photos[key]["space"]:
                self.err(f"{key} is a {photos[key]['space']} photo inside data-space={space!r}")
            if tag == "img" and not a.get("alt", "").strip():
                self.err(f"{key} has no alt text")
        elif key in gen:
            kind = self.nearest("data-kind", a)
            if kind not in KINDS:
                self.err(f"generated asset {key} is not inside a data-kind wrapper")
            elif kind != gen[key]["kind"]:
                self.err(f"generated asset {key} is a {gen[key]['kind']} but wrapped as {kind}")
            if tag == "img" and "alt" not in a:
                self.err(f"{key} needs an alt attribute (empty is fine if decorative)")
        else:
            self.err(f"data-img={key!r} is not in image-manifest.json")


def main(root, files):
    manifest = json.loads((Path(root) / "image-manifest.json").read_text(encoding="utf-8"))
    total, errors = 0, []
    for f in files:
        c = Checker(manifest, Path(f).name)
        c.feed(Path(f).read_text(encoding="utf-8"))
        total += c.count
        errors += c.errors
    for e in errors:
        print("FAIL", e)
    print(f"check_images: {'PASS' if not errors else 'FAIL'} ({len(files)} file(s), {total} image(s), {len(errors)} problem(s))")
    return 1 if errors or not files else 0


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2:]))
