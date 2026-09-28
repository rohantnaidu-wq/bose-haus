"""Prepare web assets from photos/ and generated/raw/ into web/.

Usage:  python tools/assets.py          (skips files that are already up to date)

Photos: true size, light sharpening, WebP q76 (no upscaling).
Generated: map and textures resized, the spot sheet cut into four transparent
illustrations, loops copied. Registers generated assets and the held duplicate
in image-manifest.json.
"""
import json
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageFilter

sys.path.insert(0, str(Path(__file__).parent))
import bh  # noqa: E402

WEB = bh.ROOT / "web"
RAW = bh.ROOT / "generated" / "raw"

# The family still has to say which space this photo belongs to (same shot in both folders)
HELD = {
    "cottage-garden-08": "Same photo as nook-garden-02. Hidden until the family confirms which space it shows.",
    "nook-garden-02": "Same photo as cottage-garden-08. Hidden until the family confirms which space it shows.",
}

SPOTS = ["spot-teacup-swing", "spot-squirrel", "spot-brass-key", "spot-copper-pod-tree"]  # sheet order, 2x2
LOOPS = ["loop-walkway", "loop-rooftop", "loop-courtyard", "loop-retreat", "film-walk-in"]


def fresh(src, dst):
    return dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime


def photos(manifest):
    out = WEB / "photos"
    out.mkdir(parents=True, exist_ok=True)
    for key, p in manifest["photos"].items():
        src, dst = bh.ROOT / p["file"], out / f"{key}.webp"
        if not fresh(src, dst):
            im = Image.open(src).convert("RGB")
            im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=2))
            im.save(dst, "WEBP", quality=76, method=6)
        p["web"] = f"photos/{key}.webp"

def knock_out(im):
    """Cream paper → transparent, keeping the ink and the accent fills."""
    from PIL import ImageChops
    im = im.convert("RGB")
    paper = Image.new("RGB", im.size, im.getpixel((6, 6)))
    r, g, b = ImageChops.difference(im, paper).split()
    dist = ImageChops.lighter(ImageChops.lighter(r, g), b)
    rgba = im.copy()
    rgba.putalpha(dist.point(lambda d: 0 if d < 14 else min(255, (d - 14) * 5)))
    return rgba


def spots(out):
    src = RAW / "spots-b.png"
    if all(fresh(src, out / f"{s}.webp") for s in SPOTS):
        return
    sheet = Image.open(src)
    w, h = sheet.size
    for i, name in enumerate(SPOTS):
        x, y = i % 2, i // 2
        q = sheet.crop((x * w // 2, y * h // 2, (x + 1) * w // 2, (y + 1) * h // 2))
        q.thumbnail((480, 480), Image.LANCZOS)
        q = knock_out(q)
        box = q.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
        pad = 12
        q = q.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(q.width, box[2] + pad), min(q.height, box[3] + pad)))
        q.save(out / f"{name}.webp", "WEBP", quality=88, method=6)


def generated(manifest):
    out = WEB / "gen"
    out.mkdir(parents=True, exist_ok=True)
    gen = {}

    def reg(key, kind, rel, desc, size=None):
        gen[key] = {"kind": kind, "file": rel, "description": desc}
        if size:
            gen[key]["width"], gen[key]["height"] = size

    for name, src, width, desc in [
        ("compound-map", "map-b.png", 1600, "Illustrated compound map, the chosen version. Positions approximate."),
        ("map-2", "map-a.png", 1200, "Schematic compound map, the alternative."),
        ("film-walk-in-start", "film-start.png", 1600, "Start frame of the walk-in film: the brick path photo widened to 16:9."),
    ]:
        if not (RAW / src).exists():
            continue
        dst = out / f"{name}.webp"
        if not fresh(RAW / src, dst):
            im = Image.open(RAW / src).convert("RGB")
            im.thumbnail((width, width * 2), Image.LANCZOS)
            im.save(dst, "WEBP", quality=82, method=6)
        kind = "motion" if name.startswith("film") else "illustration"
        reg(name, kind, f"gen/{name}.webp", desc, Image.open(dst).size)

    for name, src in [("texture-leaf", "leaf-b.png"), ("texture-brass", "brass-a.png"), ("texture-red-oxide", "red-oxide.png")]:
        dst = out / f"{name}.webp"
        if not fresh(RAW / src, dst):
            Image.open(RAW / src).convert("RGB").resize((800, 800), Image.LANCZOS).save(dst, "WEBP", quality=72, method=6)
        reg(name, "texture", f"gen/{name}.webp", f"Seamless {name[8:].replace('-', ' ')} texture", (800, 800))

    spots(out)
    for name in SPOTS:
        reg(name, "illustration", f"gen/{name}.webp", name[5:].replace("-", " ") + " spot illustration",
            Image.open(out / f"{name}.webp").size)

    for loop in LOOPS:
        # Prefer the web encode (generated/web, made with ffmpeg: -g 8 for the film, ~1 MB loops)
        enc = bh.ROOT / "generated" / "web" / f"{loop}.mp4"
        src, dst = (enc if enc.exists() else RAW / f"{loop}.mp4"), out / f"{loop}.mp4"
        if not src.exists():
            continue
        if dst.exists() and dst.stat().st_size != src.stat().st_size:
            dst.unlink()
        if not fresh(src, dst):
            shutil.copy2(src, dst)
        reg(loop, "motion", f"gen/{loop}.mp4", loop.replace("-", " ") + ", H.264, muted")

    manifest["generated"] = gen


def main():
    manifest = bh.read_manifest()
    photos(manifest)
    generated(manifest)
    manifest["held"] = HELD
    (bh.ROOT / "image-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    size = sum(f.stat().st_size for f in WEB.rglob("*") if f.is_file())
    print(f"assets: {len(manifest['photos'])} photos, {len(manifest['generated'])} generated, web/ = {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
