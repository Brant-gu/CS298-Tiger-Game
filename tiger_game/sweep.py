from __future__ import annotations

from tiger_game.alphas import AlphaVector
from tiger_game.model import TigerGame
from tiger_game.solver import TigerSolver, best_actions, value


def count_segments(vectors: list[AlphaVector]) -> int:
    lines = {
        (
            round(vector.values[0] - vector.values[1], 12),
            round(vector.values[1], 12),
        )
        for vector in vectors
    }
    line_list = sorted(lines)
    points = {0.0, 1.0}

    for first in range(len(line_list)):
        slope_a, intercept_a = line_list[first]
        for second in range(first + 1, len(line_list)):
            slope_b, intercept_b = line_list[second]
            if abs(slope_a - slope_b) <= 1e-12:
                continue
            point = (intercept_b - intercept_a) / (slope_a - slope_b)
            if 0.0 <= point <= 1.0:
                points.add(point)

    ordered = sorted(points)
    winners: list[tuple[float, float]] = []
    for left, right in zip(ordered, ordered[1:]):
        belief = (left + right) / 2.0
        scored = [
            (intercept + slope * belief, slope, intercept)
            for slope, intercept in line_list
        ]
        _, slope, intercept = max(scored)
        winner = (slope, intercept)
        if not winners or abs(winners[-1][0] - winner[0]) > 1e-10 or abs(winners[-1][1] - winner[1]) > 1e-10:
            winners.append(winner)

    return len(winners)


def sweep_probabilities(
    probabilities: list[float],
    horizons: list[int],
    belief_left: float,
) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for probability in probabilities:
        solver = TigerSolver(TigerGame(p_correct=probability))
        for horizon in horizons:
            vectors = solver.solve(horizon)
            rows.append(
                {
                    "p_correct": probability,
                    "horizon": horizon,
                    "belief_left": belief_left,
                    "value": value(vectors, belief_left),
                    "best_actions": [
                        action.value
                        for action in best_actions(vectors, belief_left)
                    ],
                    "alpha_count": len(vectors),
                    "segments": count_segments(vectors),
                }
            )
    return rows