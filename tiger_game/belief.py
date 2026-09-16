from __future__ import annotations

from tiger_game.model import Action, Observation, State, TigerGame


def update_belief(
    belief_left: float,
    action: Action,
    observation: Observation,
    game: TigerGame,
) -> float:
    if not 0.0 <= belief_left <= 1.0:
        raise ValueError("belief_left must be in [0, 1]")

    prior = {State.LEFT: belief_left, State.RIGHT: 1.0 - belief_left}
    predicted = {
        next_state: sum(
            game.transition(state, action)[next_state] * prior[state]
            for state in State
        )
        for next_state in State
    }
    joint = {
        next_state: predicted[next_state]
        * game.observation_probability(next_state, action, observation)
        for next_state in State
    }
    normalizer = sum(joint.values())
    if normalizer <= 0.0:
        raise ValueError("observation has zero probability")
    return joint[State.LEFT] / normalizer