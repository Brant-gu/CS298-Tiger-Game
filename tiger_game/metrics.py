from __future__ import annotations

from dataclasses import dataclass

from tiger_game.alphas import AlphaVector


@dataclass(frozen=True)
class SolverMetrics:
    horizon: int
    accuracy: float
    discount: float
    raw_alpha_count: int
    deduplicated_alpha_count: int
    pruned_alpha_count: int
    distinct_value_lines: int
    segments: int
    runtime_ms: float


@dataclass(frozen=True)
class SolveResult:
    vectors: list[AlphaVector]
    metrics: SolverMetrics


def distinct_value_lines(vectors: list[AlphaVector]) -> int:
    return len({
        (round(vector.values[0], 12), round(vector.values[1], 12))
        for vector in vectors
    })


def count_segments(vectors: list[AlphaVector]) -> int:
    if not vectors:
        return 0
    lines = sorted({
        (
            round(vector.values[0] - vector.values[1], 12),
            round(vector.values[1], 12),
        )
        for vector in vectors
    })
    points = {0.0, 1.0}
    for first in range(len(lines)):
        slope_a, intercept_a = lines[first]
        for second in range(first + 1, len(lines)):
            slope_b, intercept_b = lines[second]
            if abs(slope_a - slope_b) <= 1e-12:
                continue
            point = (intercept_b - intercept_a) / (slope_a - slope_b)
            if 0.0 <= point <= 1.0:
                points.add(point)

    ordered = sorted(points)
    winners: list[tuple[float, float]] = []
    for left, right in zip(ordered, ordered[1:]):
        belief = (left + right) / 2.0
        _, slope, intercept = max(
            (intercept + slope * belief, slope, intercept)
            for slope, intercept in lines
        )
        winner = (slope, intercept)
        if not winners or abs(winners[-1][0] - winner[0]) > 1e-10 or abs(winners[-1][1] - winner[1]) > 1e-10:
            winners.append(winner)
    return len(winners)
