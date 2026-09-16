from __future__ import annotations

from dataclasses import dataclass

from tiger_game.model import Action


@dataclass(frozen=True)
class AlphaVector:
    values: tuple[float, float]
    action: Action

    def value_at(self, belief_left: float) -> float:
        if not 0.0 <= belief_left <= 1.0:
            raise ValueError("belief_left must be in [0, 1]")
        left, right = self.values
        return belief_left * left + (1.0 - belief_left) * right


def prune_alpha_vectors(
    vectors: list[AlphaVector],
    tolerance: float = 1e-10,
) -> list[AlphaVector]:
    unique: dict[tuple[int, int, Action], AlphaVector] = {}
    for vector in vectors:
        key = (
            round(vector.values[0], 12),
            round(vector.values[1], 12),
            vector.action,
        )
        unique.setdefault(key, vector)
    candidates = list(unique.values())

    if len(candidates) <= 1:
        return candidates

    lines = [
        (vector.values[0] - vector.values[1], vector.values[1])
        for vector in candidates
    ]
    points = {0.0, 1.0}
    for first in range(len(lines)):
        slope_a, intercept_a = lines[first]
        for second in range(first + 1, len(lines)):
            slope_b, intercept_b = lines[second]
            denominator = slope_a - slope_b
            if abs(denominator) <= tolerance:
                continue
            point = (intercept_b - intercept_a) / denominator
            if -tolerance <= point <= 1.0 + tolerance:
                points.add(min(1.0, max(0.0, point)))

    ordered = sorted(points)
    samples = list(ordered) + [
        (ordered[index] + ordered[index + 1]) / 2.0
        for index in range(len(ordered) - 1)
    ]
    keep: set[int] = set()
    for belief in samples:
        values = [candidate.value_at(belief) for candidate in candidates]
        best = max(values)
        keep.update(
            index
            for index, value in enumerate(values)
            if abs(value - best) <= tolerance
        )
    return [candidates[index] for index in sorted(keep)]