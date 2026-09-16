from __future__ import annotations

import argparse
import json

from tiger_game.model import Action, TigerGame
from tiger_game.solver import TigerSolver, best_actions, q_values, value
from tiger_game.sweep import sweep_probabilities


def solve_payload(
    horizon: int,
    belief_left: float,
    p_correct: float,
) -> dict[str, object]:
    vectors = TigerSolver(TigerGame(p_correct=p_correct)).solve(horizon)
    q_by_action = q_values(vectors, belief_left)
    return {
        "horizon": horizon,
        "belief_left": belief_left,
        "p_correct": p_correct,
        "alpha_count": len(vectors),
        "value": value(vectors, belief_left),
        "best_actions": [
            action.value for action in best_actions(vectors, belief_left)
        ],
        "q_values": {
            action.value: q_by_action[action]
            for action in Action
        },
    }


def sweep_payload(
    probabilities: list[float],
    horizons: list[int],
    belief_left: float,
) -> list[dict[str, object]]:
    return sweep_probabilities(probabilities, horizons, belief_left)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Exact finite-horizon Tiger Game solver"
    )
    parser.add_argument("--horizon", type=int, default=1)
    parser.add_argument("--belief", type=float, default=0.5)
    parser.add_argument("--p-correct", type=float, default=0.85)
    parser.add_argument("--sweep", action="store_true")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.sweep:
        payload = {
            "rows": sweep_payload(
                probabilities=[0.85, 0.70, 0.65],
                horizons=[1, 2, 3, 4],
                belief_left=args.belief,
            )
        }
    else:
        payload = solve_payload(
            horizon=args.horizon,
            belief_left=args.belief,
            p_correct=args.p_correct,
        )
    print(json.dumps(payload, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()