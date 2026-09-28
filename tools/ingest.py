"""Ingest the original photo zip into photos/{space}/{area}/{space}-{area}-{nn}.png
and write image-manifest.json (the single source of truth for every photo).

Usage:  python tools/ingest.py "D:/Bose Haus.zip"

Numbering: within each area folder, files are ordered by their view number
(view-1, view-2 ... view-10). Files without a view number (the compound folder)
are ordered alphabetically. The original filename is kept in the manifest.
"""
import hashlib, json, re, sys, zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

SPACE_DIRS = {
    "Driveway - Garden - Walkway": "compound",
    "The Cottage": "cottage",
    "The Courtyard": "courtyard",
    "The Nook": "nook",
    "The Retreat": "retreat",
    "The Rooftop": "rooftop",
}

AREA_FIX = {
    "dressing room - bathroom": "dressing-room-bathroom",
    "living-space": "living-space",
}


def area_of(space, folder):
    if space == "compound":
        return "driveway-garden-walkway"
    a = folder.lower()
    a = a[len(space) + 1:] if a.startswith(space + "-") else a
    return AREA_FIX.get(a, a.replace(" ", "-"))


def sort_key(name):
    """(series, view number): view-2 sorts before view-10."""
    base = name.lower()
    m = re.search(r"^(.*?)-?view-(\d+)\.png$", base)
    return (m.group(1), int(m.group(2))) if m else (base, 0)


def main(zip_path):
    groups = {}
    with zipfile.ZipFile(zip_path) as z:
        for info in z.infolist():
            parts = info.filename.split("/")
            if not info.filename.lower().endswith(".png") or len(parts) < 3:
                continue
            space = SPACE_DIRS[parts[1]]
            folder = parts[2] if len(parts) == 4 else ""
            area = area_of(space, folder)
            groups.setdefault((space, area), []).append(info)

        manifest = {"photos": {}, "generated": {}}
        for (space, area), infos in sorted(groups.items()):
            if space == "compound":
                infos.sort(key=lambda i: i.filename.split("/")[-1].lower())
            else:
                infos.sort(key=lambda i: sort_key(i.filename.split("/")[-1]))
            for n, info in enumerate(infos, 1):
                key = f"{space}-{area}-{n:02d}"
                rel = f"photos/{space}/{area}/{key}.png"
                out = ROOT / rel
                out.parent.mkdir(parents=True, exist_ok=True)
                data = z.read(info)
                out.write_bytes(data)
                with Image.open(out) as im:
                    w, h = im.size
                manifest["photos"][key] = {
                    "space": space, "area": area, "file": rel,
                    "original": info.filename.split("/", 1)[1],
                    "width": w, "height": h,
                    "sha1": hashlib.sha1(data).hexdigest(),
                }

    prev = ROOT / "image-manifest.json"
    if prev.exists():  # keep hand-edited generated / held entries
        old = json.loads(prev.read_text(encoding="utf-8"))
        manifest["generated"] = old.get("generated", {})
        manifest["held"] = old.get("held", {})
    prev.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    counts = {}
    for p in manifest["photos"].values():
        counts[p["space"]] = counts.get(p["space"], 0) + 1
    print(len(manifest["photos"]), "photos", counts)


if __name__ == "__main__":
    main(sys.argv[1])
