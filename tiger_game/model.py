from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class State(Enum):
    LEFT = 0
    RIGHT = 1


class Action(str, Enum):
    OPEN_LEFT = "open_left"
    OPEN_RIGHT = "open_right"
    LISTEN = "listen"


class Observation(str, Enum):
    HEAR_LEFT = "hear_left"
    HEAR_RIGHT = "hear_right"
    DUMMY = "dummy"


@dataclass(frozen=True)
class TigerGame:
    p_correct: float = 0.85
    open_reward: float = 10.0
    tiger_reward: float = -100.0
    listen_reward: float = -1.0
    discount: float = 1.0

    def __post_init__(self) -> None:
        if not 0.5 <= self.p_correct <= 1.0:
            raise ValueError("p_correct must be in [0.5, 1.0]")
        if not 0.0 <= self.discount <= 1.0:
            raise ValueError("discount must be in [0, 1]")

    def reward(self, state: State, action: Action) -> float:
        if action is Action.LISTEN:
            return self.listen_reward
        if action is Action.OPEN_LEFT:
            return self.tiger_reward if state is State.LEFT else self.open_reward
        return self.tiger_reward if state is State.RIGHT else self.open_reward

    def transition(self, state: State, action: Action) -> dict[State, float]:
        if action is Action.LISTEN:
            return {
                State.LEFT: 1.0 if state is State.LEFT else 0.0,
                State.RIGHT: 1.0 if state is State.RIGHT else 0.0,
            }
        return {State.LEFT: 0.5, State.RIGHT: 0.5}

    def observations(self, action: Action) -> tuple[Observation, ...]:
        if action is Action.LISTEN:
            return (Observation.HEAR_LEFT, Observation.HEAR_RIGHT)
        return (Observation.DUMMY,)

    def observation_probability(
        self,
        state: State,
        action: Action,
        observation: Observation,
    ) -> float:
        if action is Action.LISTEN:
            if observation is Observation.HEAR_LEFT:
                return self.p_correct if state is State.LEFT else 1.0 - self.p_correct
            if observation is Observation.HEAR_RIGHT:
                return 1.0 - self.p_correct if state is State.LEFT else self.p_correct
            return 0.0
        return 1.0 if observation is Observation.DUMMY else 0.0