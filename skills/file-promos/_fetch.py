"""Drive fetch helper — runs inside the bundled gdown venv.

Lists a public folder first, then downloads only the files asked for. Keeps
multi-gigabyte PSDs out of the way until they are actually wanted: a typical
promo folder is ~4 MB of banners sitting next to ~2.7 GB of working files.

    python _fetch.py <url> <output-dir> <list|images|all>
"""

import json
import os
import sys

import gdown
from gdown.download_folder import download_folder

RASTER = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".tif", ".tiff", ".bmp"}
SOURCE = {".psd", ".psb", ".ai", ".eps", ".sketch", ".fig", ".afdesign"}


def classify(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in RASTER:
        return "image"
    if ext in SOURCE:
        return "source"
    return "other"


def main():
    url, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]

    try:
        listing = download_folder(url=url, output=out, skip_download=True, quiet=True)
    except Exception as e:                                    # noqa: BLE001
        print(json.dumps({"error": str(e)}))
        return 1

    items = [
        {"id": f.id, "path": f.path, "local": f.local_path, "kind": classify(f.path)}
        for f in listing
    ]

    if mode == "list":
        print(json.dumps({"items": items, "downloaded": []}, indent=2))
        return 0

    wanted = [i for i in items if mode == "all" or i["kind"] == "image"]
    skipped = [i for i in items if i not in wanted]

    done, failed = [], []
    for i, item in enumerate(wanted, 1):
        os.makedirs(os.path.dirname(item["local"]), exist_ok=True)
        print(f"[{i}/{len(wanted)}] {item['path']}", file=sys.stderr, flush=True)
        try:
            got = gdown.download(
                url="https://drive.google.com/uc?id=" + item["id"],
                output=item["local"],
                quiet=True,
                resume=True,
            )
            (done if got else failed).append(item)
        except Exception as e:                                # noqa: BLE001
            item["error"] = str(e)
            failed.append(item)

    print(json.dumps({
        "items": items, "downloaded": done,
        "skipped": skipped, "failed": failed,
    }, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
