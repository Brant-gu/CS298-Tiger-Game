from __future__ import annotations

from tiger_game.model import TigerGame
from tiger_game.solver import TigerSolver


def build_visualization_payload(
    probabilities: tuple[float, ...] = (0.85, 0.70, 0.65),
    horizons: tuple[int, ...] = (1, 2, 3, 4),
) -> dict[str, object]:
    policies: dict[str, list[dict[str, object]]] = {}
    for probability in probabilities:
        solver = TigerSolver(TigerGame(p_correct=probability))
        for horizon in horizons:
            key = f"{probability:.2f}:{horizon}"
            policies[key] = [
                {
                    "action": vector.action.value,
                    "values": [
                        round(vector.values[0], 12),
                        round(vector.values[1], 12),
                    ],
                }
                for vector in solver.solve(horizon)
            ]

    return {
        "probabilities": list(probabilities),
        "horizons": list(horizons),
        "policies": policies,
        "rewards": {
            "treasure": 10,
            "tiger": -100,
            "listen": -1,
        },
        "paper": {
            "last_step_thresholds": [0.1, 0.9],
            "two_step_segments": 5,
            "accuracy_85_two_signal_belief": 0.9697986577,
            "accuracy_65_five_signal_belief": 0.9566941510,
        },
    }