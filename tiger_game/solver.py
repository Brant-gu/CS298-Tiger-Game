from __future__ import annotations

from dataclasses import dataclass
from itertools import product

from tiger_game.alphas import AlphaVector, prune_alpha_vectors
from tiger_game.model import Action, State, TigerGame


@dataclass(frozen=True)
class TigerSolver:
    game: TigerGame

    def solve(self, horizon: int) -> list[AlphaVector]:
        if horizon < 1:
            raise ValueError("horizon must be positive")

        vectors = [AlphaVector((0.0, 0.0), Action.LISTEN)]
        for _ in range(horizon):
            vectors = self._backup(vectors)
        return vectors

    def _backup(self, previous: list[AlphaVector]) -> list[AlphaVector]:
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

        return prune_alpha_vectors(generated)


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