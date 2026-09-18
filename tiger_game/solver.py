from __future__ import annotations

from dataclasses import dataclass
from itertools import product
import time

from tiger_game.alphas import AlphaVector, prune_alpha_vectors_detailed
from tiger_game.metrics import SolveResult, SolverMetrics, count_segments, distinct_value_lines
from tiger_game.model import Action, State, TigerGame


@dataclass(frozen=True)
class TigerSolver:
    game: TigerGame

    def solve(self, horizon: int) -> list[AlphaVector]:
        return self.solve_with_metrics(horizon).vectors

    def solve_with_metrics(self, horizon: int) -> SolveResult:
        if horizon < 1:
            raise ValueError("horizon must be positive")

        started = time.perf_counter()
        vectors = [AlphaVector((0.0, 0.0), Action.LISTEN)]
        raw_count = 0
        deduplicated_count = 0
        for _ in range(horizon):
            generated = self._generate_vectors(vectors)
            raw_count = len(generated)
            prune_result = prune_alpha_vectors_detailed(generated)
            deduplicated_count = prune_result.deduplicated_count
            vectors = prune_result.vectors

        runtime_ms = (time.perf_counter() - started) * 1000.0
        metrics = SolverMetrics(
            horizon=horizon,
            accuracy=self.game.p_correct,
            discount=self.game.discount,
            raw_alpha_count=raw_count,
            deduplicated_alpha_count=deduplicated_count,
            pruned_alpha_count=len(vectors),
            distinct_value_lines=distinct_value_lines(vectors),
            segments=count_segments(vectors),
            runtime_ms=runtime_ms,
        )
        return SolveResult(vectors=vectors, metrics=metrics)

    def _generate_vectors(self, previous: list[AlphaVector]) -> list[AlphaVector]:
        generated: list[AlphaVector] = []

        for action in Action:
            observations = self.game.observations(action)
            for children in product(previous, repeat=len(observations)):
                values: list[float] = []
                for state in State:
                    total = self.game.reward(state, action)
                    for next_state in State:
                        transition = self.game.transition(state, action)[next_state]
                        continuation = sum(
                            self.game.observation_probability(
                                next_state, action, observation
                            )
                            * child.values[next_state.value]
                            for observation, child in zip(observations, children)
                        )
                        total += self.game.discount * transition * continuation
                    values.append(total)
                generated.append(AlphaVector(tuple(values), action))

        return generated


def q_values(vectors: list[AlphaVector], belief_left: float) -> dict[Action, float]:
    result = {action: float("-inf") for action in Action}
    for vector in vectors:
        result[vector.action] = max(
            result[vector.action],
            vector.value_at(belief_left),
        )
    return result


def value(vectors: list[AlphaVector], belief_left: float) -> float:
    return max(vector.value_at(belief_left) for vector in vectors)


def best_actions(
    vectors: list[AlphaVector],
    belief_left: float,
    tolerance: float = 1e-9,
) -> list[Action]:
    values = q_values(vectors, belief_left)
    best = max(values.values())
    return [
        action
        for action in Action
        if abs(values[action] - best) <= tolerance
    ]