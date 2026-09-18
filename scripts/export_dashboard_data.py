from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tiger_game.experiment_runner import build_dashboard_payload, get_git_commit


def main() -> None:
    payload = build_dashboard_payload(
        probabilities=[0.85],
        horizons=[1, 2, 3, 4, 5, 6],
        belief_left=0.5,
        git_commit=get_git_commit(str(ROOT)),
    )
    output = ROOT / "visualization" / "dashboard-data.js"
    output.write_text(
        "window.DASHBOARD_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(output)


if __name__ == "__main__":
    main()
