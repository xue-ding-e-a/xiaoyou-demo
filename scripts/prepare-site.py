#!/usr/bin/env python3
"""Build the public static site from the explicit outputs allowlist.

Run from any directory: python scripts/prepare-site.py
The manifest has no timestamps and excludes its own hash. Its tree fingerprint
covers every published payload file, including the compatibility HTML entry.
"""

from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path, PurePosixPath
import posixpath
import re
import shutil
import stat
import sys
from urllib.parse import unquote, urlsplit


WORKSPACE = Path(__file__).resolve().parent.parent
SOURCE = WORKSPACE / "outputs"
DESTINATION = WORKSPACE / "site"
MANIFEST_NAME = "asset-manifest.json"
ENTRY_NAME = "xiaoyou-demo.html"
ROOT_FILE = re.compile(r"xiaoyou-[^/]+\.(?:html|js|css)\Z", re.IGNORECASE)
ASSET_SUFFIXES = {
    ".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".avif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".eot",
}
PRIVATE_ASSET_NAME = re.compile(
    r"(?:^|[-_.])(?:qr|login|session|cookie|auth|snapshot|screenshot|capture|cache)(?:[-_.]|$)",
    re.IGNORECASE,
)
CSS_URL = re.compile(
    r"url\(\s*(?:\"(?P<double>(?:\\.|[^\"\\])*)\"|'(?P<single>(?:\\.|[^'\\])*)'|(?P<bare>(?:\\.|[^)\\])*))\s*\)",
    re.IGNORECASE,
)
CSS_IMPORT = re.compile(r"@import\s+(?:\"([^\"]+)\"|'([^']+)')", re.IGNORECASE)


def fail(message: str) -> None:
    raise ValueError(message)


def assert_plain_path(path: Path, root: Path) -> Path:
    """Reject traversal, symlinks and Windows junction/reparse targets."""
    resolved_root = root.resolve(strict=True)
    resolved = path.resolve(strict=False)
    if resolved == resolved_root or not resolved.is_relative_to(resolved_root):
        fail(f"Refusing path outside its intended directory: {path}")
    current = path
    while current != root:
        if current.exists() or current.is_symlink():
            info = current.lstat()
            if current.is_symlink() or getattr(info, "st_file_attributes", 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT:
                fail(f"Refusing symlink/junction/reparse path: {current}")
        if current.parent == current:
            fail(f"Path does not have the expected root: {path}")
        current = current.parent
    return resolved


def verify_roots() -> None:
    if Path(__file__).resolve() != WORKSPACE / "scripts" / "prepare-site.py":
        fail("The script must be located at <workspace>/scripts/prepare-site.py")
    if not SOURCE.is_dir():
        fail(f"Source directory does not exist: {SOURCE}")
    assert_plain_path(SOURCE, WORKSPACE)
    # This exact target is verified before any write or stale-file deletion.
    resolved = assert_plain_path(DESTINATION, WORKSPACE)
    if resolved != WORKSPACE.resolve() / "site" or resolved in {WORKSPACE.resolve(), SOURCE.resolve()}:
        fail(f"Unsafe publication target: {resolved}")
    if DESTINATION.exists() and not DESTINATION.is_dir():
        fail("The site target already exists as a file")


def inventory(directory: Path) -> list[Path]:
    result = []
    for current, directories, files in os.walk(directory, followlinks=False):
        folder = Path(current)
        for name in directories:
            assert_plain_path(folder / name, directory)
        for name in files:
            file = folder / name
            assert_plain_path(file, directory)
            if not file.is_file():
                fail(f"Not a regular file: {file}")
            result.append(file)
    return sorted(result, key=lambda file: file.relative_to(directory).as_posix())


def collect_sources() -> dict[str, Path]:
    sources = {}
    for file in SOURCE.iterdir():
        if ROOT_FILE.fullmatch(file.name):
            assert_plain_path(file, SOURCE)
            if not file.is_file():
                fail(f"An allowed root entry is not a regular file: {file}")
            sources[file.name] = file
    assets = SOURCE / "upcv-assets"
    assert_plain_path(assets, SOURCE)
    if not assets.is_dir():
        fail("The required outputs/upcv-assets directory is missing")
    for file in inventory(assets):
        if file.suffix.lower() not in ASSET_SUFFIXES:
            fail(f"Non-resource file found inside the asset directory: {file}")
        if any(PRIVATE_ASSET_NAME.search(part) for part in file.relative_to(assets).parts):
            fail(f"Potential private/cache asset must be reviewed before publication: {file}")
        sources[file.relative_to(SOURCE).as_posix()] = file
    if ENTRY_NAME not in sources:
        fail(f"The required outputs/{ENTRY_NAME} entry is missing")
    # Preserve the original filename while giving static hosts their default entry.
    sources["index.html"] = sources[ENTRY_NAME]
    return dict(sorted(sources.items()))


class ReferenceValidator:
    def __init__(self, sources: dict[str, Path]) -> None:
        self.sources = sources
        self.local_references = set()
        self.remote_references = set()
        self.failures = set()

    def check(self, value: str, owner: str, kind: str) -> None:
        value = value.strip()
        if not value or value.startswith("#"):
            return
        parsed = urlsplit(value)
        if parsed.scheme.lower() == "data":
            return
        if parsed.scheme.lower() in {"http", "https"} or parsed.netloc:
            self.remote_references.add((owner, kind, value))
            return
        if parsed.scheme:
            self.failures.add(f"{owner}: unsupported {kind} resource URL {value!r}")
            return
        decoded = unquote(parsed.path)
        if not decoded:
            return
        if decoded.startswith(("/", "\\")) or "\\" in decoded:
            self.failures.add(f"{owner}: root-relative/Windows {kind} path breaks project hosting: {value!r}")
            return
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(owner), decoded))
        if resolved == ".." or resolved.startswith("../") or PurePosixPath(resolved).is_absolute():
            self.failures.add(f"{owner}: {kind} path escapes the public site: {value!r}")
            return
        self.local_references.add((owner, kind, resolved))
        if resolved not in self.sources:
            self.failures.add(f"{owner}: missing {kind} resource {resolved!r} (from {value!r})")

    def css(self, text: str, owner: str) -> None:
        text = re.sub(r"/\*[\s\S]*?\*/", "", text)
        for match in CSS_URL.finditer(text):
            value = next(group for group in match.groups() if group is not None).strip()
            value = re.sub(r"\\([\\'\"() ])", r"\1", value)
            self.check(value, owner, "css-url")
        for match in CSS_IMPORT.finditer(text):
            self.check(match[1] or match[2], owner, "css-import")

    def validate(self) -> dict:
        for name, source in self.sources.items():
            if source.suffix.lower() == ".css":
                self.css(source.read_text(encoding="utf-8-sig"), name)
            elif source.suffix.lower() == ".html":
                parser = HTMLReferences(self, name)
                parser.feed(source.read_text(encoding="utf-8-sig"))
                parser.close()
        catalogue_path = self.sources.get("upcv-assets/templates.js")
        template_count = 0
        if catalogue_path:
            match = re.search(r"window\.UPCV_TEMPLATES\s*=\s*([\s\S]+);\s*$", catalogue_path.read_text(encoding="utf-8-sig"))
            if not match:
                self.failures.add("Cannot parse the static template-image catalogue")
            else:
                catalogue = json.loads(match[1])
                for item in catalogue:
                    self.check(item["image"], "index.html", "dynamic-template")
                    template_count += 1
        for theme in ("light", "dark"):
            self.check(f"upcv-assets/up-job-wordmark-{theme}.svg", "index.html", "dynamic-wordmark")
        if self.failures:
            fail("Resource validation failed:\n" + "\n".join(sorted(self.failures)))
        remote = [dict(source=source, kind=kind, url=url) for source, kind, url in sorted(self.remote_references)]
        return {
            "local_references_checked": len(self.local_references),
            "template_images_checked": template_count,
            "remote_references": remote,
            "remote_reference_note": (
                "The original stylesheet retains remote backgrounds for unused membership dialogs. "
                "They are reported here; this packaging check does not test browser rule matching or remote availability."
                if remote else "No remote HTML/CSS resource references were found."
            ),
        }


class HTMLReferences(HTMLParser):
    def __init__(self, validator: ReferenceValidator, owner: str) -> None:
        super().__init__(convert_charrefs=True)
        self.validator, self.owner, self.in_style = validator, owner, False

    def handle_starttag(self, tag: str, attributes: list[tuple[str, str | None]]) -> None:
        attrs = dict(attributes)
        if tag == "base":
            self.validator.failures.add(f"{self.owner}: a base element would change relative resource resolution")
        for attribute in ("src", "poster", "data"):
            if attrs.get(attribute) and (attribute != "data" or tag == "object"):
                self.validator.check(attrs[attribute], self.owner, f"html-{attribute}")
        if tag == "link" and attrs.get("href"):
            self.validator.check(attrs["href"], self.owner, "html-link")
        if attrs.get("srcset"):
            for candidate in attrs["srcset"].split(","):
                value = candidate.strip().split()
                if value:
                    self.validator.check(value[0], self.owner, "html-srcset")
        if attrs.get("style"):
            self.validator.css(attrs["style"], self.owner)
        if tag == "style":
            self.in_style = True

    handle_startendtag = handle_starttag

    def handle_endtag(self, tag: str) -> None:
        if tag == "style":
            self.in_style = False

    def handle_data(self, data: str) -> None:
        if self.in_style:
            self.validator.css(data, self.owner)


def digest(file: Path) -> str:
    hasher = hashlib.sha256()
    with file.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def synchronize(sources: dict[str, Path]) -> tuple[dict, str]:
    DESTINATION.mkdir(exist_ok=True)
    assert_plain_path(DESTINATION, WORKSPACE)
    # Reject unexpected junctions before writing or removing any stale entry.
    existing = inventory(DESTINATION)
    rows = []
    for name, source in sources.items():
        target = DESTINATION.joinpath(*PurePosixPath(name).parts)
        assert_plain_path(target, DESTINATION)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        source_hash, target_hash = digest(source), digest(target)
        if source_hash != target_hash:
            fail(f"Source changed while copying, or copy verification failed: {name}")
        rows.append({"path": name, "bytes": target.stat().st_size, "sha256": target_hash})
    tree_input = "".join(f"{row['sha256']}  {row['bytes']}  {row['path']}\n" for row in rows).encode("utf-8")
    manifest = {
        "schema": "xiaoyou-static-assets-v1",
        "algorithm": "sha256",
        "entrypoint": "index.html",
        "compatibility_entrypoint": ENTRY_NAME,
        "file_count": len(rows),
        "total_bytes": sum(row["bytes"] for row in rows),
        "tree_sha256": hashlib.sha256(tree_input).hexdigest(),
        "manifest_note": "The file list and tree hash exclude asset-manifest.json itself.",
        "files": rows,
    }
    manifest_file = DESTINATION / MANIFEST_NAME
    assert_plain_path(manifest_file, DESTINATION)
    with manifest_file.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    expected = {*sources, MANIFEST_NAME}
    # Remove only verified stale regular files; never invoke recursive deletion.
    for file in existing:
        if file.relative_to(DESTINATION).as_posix() not in expected:
            assert_plain_path(file, DESTINATION)
            file.unlink()
    for current, directories, _ in os.walk(DESTINATION, topdown=False, followlinks=False):
        for name in directories:
            folder = Path(current) / name
            assert_plain_path(folder, DESTINATION)
            if not any(folder.iterdir()):
                folder.rmdir()
    actual = {file.relative_to(DESTINATION).as_posix() for file in inventory(DESTINATION)}
    if actual != expected:
        fail(f"Publication allowlist mismatch: extra={sorted(actual-expected)}, missing={sorted(expected-actual)}")
    if (DESTINATION / "index.html").read_bytes() != (DESTINATION / ENTRY_NAME).read_bytes():
        fail("The host entrypoint must exactly match the compatibility HTML")
    return manifest, digest(manifest_file)


def main() -> None:
    verify_roots()
    sources = collect_sources()
    validation = ReferenceValidator(sources).validate()
    manifest, manifest_hash = synchronize(sources)
    # Validate the actual copied files as well, rather than only the source plan.
    copied = {name: DESTINATION.joinpath(*PurePosixPath(name).parts) for name in sources}
    if ReferenceValidator(copied).validate() != validation:
        fail("Copied resource validation differs from the source allowlist")
    print(json.dumps({
        "success": True,
        "site_directory": str(DESTINATION.resolve()),
        "payload_files": manifest["file_count"],
        "payload_bytes": manifest["total_bytes"],
        "published_files_including_manifest": manifest["file_count"] + 1,
        "published_bytes_including_manifest": manifest["total_bytes"] + (DESTINATION / MANIFEST_NAME).stat().st_size,
        "tree_sha256": manifest["tree_sha256"],
        "manifest_sha256": manifest_hash,
        "validation": validation,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"prepare-site: {error}", file=sys.stderr)
        sys.exit(1)
