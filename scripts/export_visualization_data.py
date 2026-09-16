from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tiger_game.visualization_data import build_visualization_payload


def main() -> None:
    output = ROOT / "visualization" / "data.js"
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = build_visualization_payload()
    output.write_text(
        "window.TIGER_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(output)


if __name__ == "__main__":
    main()