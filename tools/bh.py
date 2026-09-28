"""Shared helpers for the Bose Haus build and checks.

read_content() parses src/content.js (plain JS object literals: unquoted keys,
comments and trailing commas are fine) into Python dicts, so the build and
the browser both read the same single source.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPACES = ["retreat", "rooftop", "courtyard", "nook", "cottage"]  # largest first
LITERALS = {"true": True, "false": False, "null": None}
NUMBER_OR_LITERAL = re.compile(r"-?\d+(\.\d+)?|true|false|null")
IDENT = re.compile(r"[A-Za-z_$][\w$]*")

class _Parser:
    def __init__(self, src, i):
        self.s, self.i = src, i

    def ws(self):
        s = self.s
        while self.i < len(s):
            if s[self.i] in " \t\r\n":
                self.i += 1
            elif s.startswith("//", self.i):
                nl = s.find("\n", self.i)
                self.i = nl if nl != -1 else len(s)
            elif s.startswith("/*", self.i):
                self.i = s.index("*/", self.i) + 2
            else:
                break

    def value(self):
        self.ws()
        c = self.s[self.i]
        if c == "{":
            return self.obj()
        if c == "[":
            return self.arr()
        if c in "\"'":
            return self.string()
        m = NUMBER_OR_LITERAL.match(self.s, self.i)
        if not m:
            raise ValueError(f"content.js: unexpected text near {self.s[self.i:self.i + 40]!r}")
        self.i = m.end()
        t = m.group(0)
        if t in LITERALS:
            return LITERALS[t]
        return float(t) if "." in t else int(t)

    def string(self):
        q = self.s[self.i]
        self.i += 1
        out = []
        while self.s[self.i] != q:
            c = self.s[self.i]
            if c == "\\":
                self.i += 1
                c = {"n": "\n", "t": "\t"}.get(self.s[self.i], self.s[self.i])
            out.append(c)
            self.i += 1
        self.i += 1
        return "".join(out)

    def key(self):
        self.ws()
        if self.s[self.i] in "\"'":
            return self.string()
        m = IDENT.match(self.s, self.i)
        self.i = m.end()
        return m.group(0)

    def obj(self):
        self.i += 1
        out = {}
        while True:
            self.ws()
            if self.s[self.i] == "}":
                self.i += 1
                return out
            k = self.key()
            self.ws()
            if self.s[self.i] != ":":
                raise ValueError(f"content.js: expected ':' after {k!r}")
            self.i += 1
            out[k] = self.value()
            self.ws()
            if self.s[self.i] == ",":
                self.i += 1

    def arr(self):
        self.i += 1
        out = []
        while True:
            self.ws()
            if self.s[self.i] == "]":
                self.i += 1
                return out
            out.append(self.value())
            self.ws()
            if self.s[self.i] == ",":
                self.i += 1


def read_content(path=ROOT / "src" / "content.js"):
    """Return {"SETTINGS": ..., "COPY": ..., "MEDIA": ...} from content.js."""
    src = Path(path).read_text(encoding="utf-8")
    return {m.group(1): _Parser(src, m.end()).value()
            for m in re.finditer(r"^const\s+([A-Z_]+)\s*=", src, re.M)}


def read_manifest():
    return json.loads((ROOT / "image-manifest.json").read_text(encoding="utf-8"))
