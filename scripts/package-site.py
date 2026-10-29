#!/usr/bin/env python3
"""Build site/ and create a verified ZIP ready for Netlify Drop.

Run: python scripts/package-site.py
Only site/ files enter the archive; index.html is at the ZIP root.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import subprocess
import sys
import tempfile
import zipfile


WORKSPACE = Path(__file__).resolve().parent.parent
SITE = WORKSPACE / "site"
OUTPUTS = WORKSPACE / "outputs"
ARCHIVE = OUTPUTS / "xiaoyou-demo-site.zip"
MANIFEST = "asset-manifest.json"


def verify_path(path: Path) -> None:
    if not path.resolve().is_relative_to(WORKSPACE) or path == WORKSPACE:
        raise ValueError(f"Path escapes the workspace: {path}")
    current = path
    while current != WORKSPACE:
        if current.exists() or current.is_symlink():
            info = current.lstat()
            if current.is_symlink() or getattr(info, "st_file_attributes", 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT:
                raise ValueError(f"Refusing symlink/junction/reparse path: {current}")
        current = current.parent


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    for path in (SITE, OUTPUTS, ARCHIVE, WORKSPACE / "scripts" / "prepare-site.py"):
        verify_path(path)
    environment = dict(os.environ, PYTHONIOENCODING="utf-8")
    build = subprocess.run(
        [sys.executable, str(WORKSPACE / "scripts" / "prepare-site.py")],
        cwd=WORKSPACE, env=environment, capture_output=True, text=True, encoding="utf-8",
    )
    if build.returncode:
        raise ValueError(build.stderr.strip() or build.stdout.strip() or "Site build failed")
    build_result = json.loads(build.stdout)
    manifest_bytes = (SITE / MANIFEST).read_bytes()
    if sha256(manifest_bytes) != build_result["manifest_sha256"]:
        raise ValueError("Site manifest changed after the build")
    manifest = json.loads(manifest_bytes)
    rows = {row["path"]: row for row in manifest["files"]}
    if len(rows) != manifest["file_count"] or MANIFEST in rows:
        raise ValueError("Invalid or duplicate entries in the asset manifest")
    expected = set(rows) | {MANIFEST}
    files = {}
    for current, directories, names in os.walk(SITE, followlinks=False):
        for name in directories:
            verify_path(Path(current) / name)
        for name in names:
            path = Path(current) / name
            verify_path(path)
            if not path.is_file():
                raise ValueError(f"Not a regular site file: {path}")
            files[path.relative_to(SITE).as_posix()] = path
    if set(files) != expected:
        raise ValueError("Site file set differs from the verified manifest")
    if "index.html" not in files:
        raise ValueError("The ZIP must contain index.html at its root")

    hashes = {}
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(prefix=".xiaoyou-demo-site-", suffix=".tmp", dir=OUTPUTS, delete=False) as handle:
            temporary = Path(handle.name)
        verify_path(temporary)
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for name, path in sorted(files.items()):
                if PurePosixPath(name).is_absolute() or ".." in PurePosixPath(name).parts:
                    raise ValueError(f"Unsafe ZIP member: {name}")
                data = path.read_bytes()
                value = sha256(data)
                if name == MANIFEST:
                    if data != manifest_bytes:
                        raise ValueError("Site manifest changed during packaging")
                elif len(data) != rows[name]["bytes"] or value != rows[name]["sha256"]:
                    raise ValueError(f"Site content differs from its manifest: {name}")
                hashes[name] = value
                info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
                info.create_system = 0
                info.external_attr = 0o100644 << 16
                archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        with zipfile.ZipFile(temporary) as archive:
            if len(archive.infolist()) != len(expected) or set(archive.namelist()) != expected:
                raise ValueError("ZIP member set differs from site contents")
            if archive.testzip() is not None:
                raise ValueError("ZIP CRC verification failed")
            for name, value in hashes.items():
                if sha256(archive.read(name)) != value:
                    raise ValueError(f"ZIP member verification failed: {name}")
            total_bytes = sum(info.file_size for info in archive.infolist())
        verify_path(ARCHIVE)
        temporary.replace(ARCHIVE)
        print(json.dumps({
            "success": True,
            "archive": str(ARCHIVE),
            "members": len(expected),
            "uncompressed_bytes": total_bytes,
            "archive_bytes": ARCHIVE.stat().st_size,
            "archive_sha256": sha256(ARCHIVE.read_bytes()),
            "root_entrypoint": "index.html",
            "build": build_result,
        }, ensure_ascii=False, indent=2))
    finally:
        if temporary is not None and temporary.exists():
            verify_path(temporary)
            temporary.unlink()


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, zipfile.BadZipFile) as error:
        print(f"package-site: {error}", file=sys.stderr)
        sys.exit(1)
