# Tiger Game Exact Solver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an exact, testable finite-horizon Tiger Game solver using alpha vectors and the corrected 85% observation probability.

**Architecture:** Model a two-state POMDP in `model.py`, represent belief functions with alpha vectors in `alphas.py`, and perform exact finite-horizon backups in `solver.py`. Keep the first version to two states, three actions, finite horizon, and the standard library only.

**Tech Stack:** Python 3.11+, `dataclasses`, `enum`, `itertools`, `unittest`; no required third-party packages.

---

## Scope

### Included

- Tiger left / tiger right states.
- Open left / open right / listen actions.
- Correct listen probability: 85%.
- Exact belief-space value iteration.
- Q values, value, best actions, alpha count, and segment count.
- Tests for rewards, Bayesian updates, one-step thresholds, backup, and growth.

### Excluded

- Soccer / Markov Game work.
- General POMG solvers.
- Mechanism design optimization.
- Infinite-horizon convergence proof.
- Deep reinforcement learning.

## File Structure

- `pyproject.toml`
- `README.md`
- `tiger_game/__init__.py`
- `tiger_game/model.py`
- `tiger_game/belief.py`
- `tiger_game/alphas.py`
- `tiger_game/solver.py`
- `tiger_game/cli.py`
- `tiger_game/sweep.py`
- `tests/test_model.py`
- `tests/test_belief.py`
- `tests/test_one_step.py`
- `tests/test_solver.py`
- `tests/test_sweep.py`

## Task 0: Initialize the Project

**Files:**
- Create: `pyproject.toml`
- Create: `tiger_game/__init__.py`
- Create: `tests/__init__.py`

- [ ] **Step 1: Initialize Git if needed**

Run `git rev-parse --is-inside-work-tree`. If it fails, run `git init`.

- [ ] **Step 2: Create `pyproject.toml`**

```toml
[project]
name = "tiger-game"
version = "0.1.0"
description = "Exact finite-horizon solver for the Tiger Game POMDP"
requires-python = ">=3.11"
dependencies = []

[tool.setuptools.packages.find]
include = ["tiger_game*"]
```

- [ ] **Step 3: Create `tiger_game/__init__.py`**

```python
"""Exact finite-horizon Tiger Game solver."""

from tiger_game.model import Action, Observation, State, TigerGame

__all__ = ["Action", "Observation", "State", "TigerGame"]
```

Create an empty `tests/__init__.py`.

- [ ] **Step 4: Verify import**

Run `python -c "import tiger_game; print(tiger_game.__all__)"`.

Expected: `['Action', 'Observation', 'State', 'TigerGame']`.

- [ ] **Step 5: Commit**

```powershell
git add pyproject.toml tiger_game tests
git commit -m "chore: initialize tiger game project"
```
## Task 1: Implement the Tiger Game Model

**Files:**
- Create: `tiger_game/model.py`
- Test: `tests/test_model.py`

- [ ] **Step 1: Write failing reward and transition tests**

Create `tests/test_model.py`:

```python
import unittest

from tiger_game.model import Action, Observation, State, TigerGame


class TigerGameModelTest(unittest.TestCase):
    def setUp(self) -> None:
        self.game = TigerGame()

    def test_rewards(self) -> None:
        self.assertEqual(self.game.reward(State.LEFT, Action.OPEN_LEFT), -100.0)
        self.assertEqual(self.game.reward(State.RIGHT, Action.OPEN_LEFT), 10.0)
        self.assertEqual(self.game.reward(State.LEFT, Action.OPEN_RIGHT), 10.0)
        self.assertEqual(self.game.reward(State.RIGHT, Action.OPEN_RIGHT), -100.0)
        self.assertEqual(self.game.reward(State.LEFT, Action.LISTEN), -1.0)

    def test_listen_keeps_state(self) -> None:
        transition = self.game.transition(State.LEFT, Action.LISTEN)
        self.assertEqual(transition[State.LEFT], 1.0)
        self.assertEqual(transition[State.RIGHT], 0.0)

    def test_open_resets_state(self) -> None:
        transition = self.game.transition(State.LEFT, Action.OPEN_LEFT)
        self.assertEqual(transition[State.LEFT], 0.5)
        self.assertEqual(transition[State.RIGHT], 0.5)

    def test_observations(self) -> None:
        self.assertEqual(
            self.game.observations(Action.LISTEN),
            (Observation.HEAR_LEFT, Observation.HEAR_RIGHT),
        )
        self.assertEqual(
            self.game.observations(Action.OPEN_LEFT),
            (Observation.DUMMY,),
        )

    def test_85_percent_emissions(self) -> None:
        self.assertAlmostEqual(
            self.game.observation_probability(
                State.LEFT, Action.LISTEN, Observation.HEAR_LEFT
            ),
            0.85,
        )
        self.assertAlmostEqual(
            self.game.observation_probability(
                State.RIGHT, Action.LISTEN, Observation.HEAR_LEFT
            ),
            0.15,
        )
```

- [ ] **Step 2: Run and verify failure**

Run `python -m unittest tests.test_model -v`. Expected: import failure.

- [ ] **Step 3: Implement `tiger_game/model.py`**

```python
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
        self, state: State, action: Action, observation: Observation
    ) -> float:
        if action is Action.LISTEN:
            if observation is Observation.HEAR_LEFT:
                return self.p_correct if state is State.LEFT else 1.0 - self.p_correct
            if observation is Observation.HEAR_RIGHT:
                return 1.0 - self.p_correct if state is State.LEFT else self.p_correct
            return 0.0
        return 1.0 if observation is Observation.DUMMY else 0.0
```

- [ ] **Step 4: Run tests**

Run `python -m unittest tests.test_model -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/model.py tests/test_model.py
git commit -m "feat: add tiger game model"
```

## Task 2: Implement Bayesian Belief Updates

**Files:**
- Create: `tiger_game/belief.py`
- Test: `tests/test_belief.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_belief.py`:

```python
import unittest

from tiger_game.belief import update_belief
from tiger_game.model import Action, Observation, TigerGame


class BeliefUpdateTest(unittest.TestCase):
    def setUp(self) -> None:
        self.game = TigerGame(p_correct=0.85)

    def test_one_left_signal(self) -> None:
        value = update_belief(
            0.5, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        self.assertAlmostEqual(value, 0.85)

    def test_two_left_signals(self) -> None:
        first = update_belief(
            0.5, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        second = update_belief(
            first, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        self.assertAlmostEqual(second, 0.9697986577, places=8)

    def test_open_resets_to_half(self) -> None:
        value = update_belief(
            0.95, Action.OPEN_LEFT, Observation.DUMMY, self.game
        )
        self.assertAlmostEqual(value, 0.5)
```

- [ ] **Step 2: Run and verify failure**

Run `python -m unittest tests.test_belief -v`. Expected: import failure.

- [ ] **Step 3: Implement `tiger_game/belief.py`**

```python
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
```

- [ ] **Step 4: Run tests**

Run `python -m unittest tests.test_belief -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/belief.py tests/test_belief.py
git commit -m "feat: add bayesian belief updates"
```
## Task 3: Implement Alpha Vectors and Pruning

**Files:**
- Create: `tiger_game/alphas.py`
- Test: `tests/test_solver.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_solver.py`:

```python
import unittest

from tiger_game.alphas import AlphaVector, prune_alpha_vectors
from tiger_game.model import Action


class AlphaVectorTest(unittest.TestCase):
    def test_value_at_belief(self) -> None:
        alpha = AlphaVector((10.0, -100.0), Action.OPEN_LEFT)
        self.assertAlmostEqual(alpha.value_at(0.0), -100.0)
        self.assertAlmostEqual(alpha.value_at(0.5), -45.0)
        self.assertAlmostEqual(alpha.value_at(1.0), 10.0)

    def test_remove_dominated(self) -> None:
        strong = AlphaVector((10.0, 10.0), Action.LISTEN)
        weak = AlphaVector((9.0, 9.0), Action.LISTEN)
        self.assertEqual(prune_alpha_vectors([strong, weak]), [strong])

    def test_keep_all_one_step_actions(self) -> None:
        vectors = [
            AlphaVector((-100.0, 10.0), Action.OPEN_LEFT),
            AlphaVector((10.0, -100.0), Action.OPEN_RIGHT),
            AlphaVector((-1.0, -1.0), Action.LISTEN),
        ]
        result = prune_alpha_vectors(vectors)
        self.assertEqual({vector.action for vector in result}, set(Action))
```

- [ ] **Step 2: Run and verify failure**

Run `python -m unittest tests.test_solver -v`. Expected: import failure.

- [ ] **Step 3: Implement `tiger_game/alphas.py`**

```python
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
    vectors: list[AlphaVector], tolerance: float = 1e-10
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
            index for index, value in enumerate(values)
            if abs(value - best) <= tolerance
        )
    return [candidates[index] for index in sorted(keep)]
```

- [ ] **Step 4: Run tests**

Run `python -m unittest tests.test_solver -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/alphas.py tests/test_solver.py
git commit -m "feat: add alpha vector pruning"
```

## Task 4: Implement Exact Finite-Horizon Backup

**Files:**
- Create: `tiger_game/solver.py`
- Modify: `tests/test_solver.py`

- [ ] **Step 1: Add failing solver tests**

Append:

```python
from tiger_game.model import TigerGame
from tiger_game.solver import TigerSolver, best_actions, q_values, value


class TigerSolverTest(unittest.TestCase):
    def setUp(self) -> None:
        self.solver = TigerSolver(TigerGame(p_correct=0.85))

    def test_horizon_one(self) -> None:
        vectors = self.solver.solve(1)
        self.assertEqual(len(vectors), 3)
        self.assertEqual(best_actions(vectors, 0.5), [Action.LISTEN])
        self.assertAlmostEqual(value(vectors, 0.1), -1.0)
        self.assertAlmostEqual(value(vectors, 0.9), -1.0)

    def test_horizon_two_center_value(self) -> None:
        self.assertAlmostEqual(value(self.solver.solve(2), 0.5), -2.0)

    def test_q_values_at_center(self) -> None:
        values = q_values(self.solver.solve(1), 0.5)
        self.assertAlmostEqual(values[Action.LISTEN], -1.0)
        self.assertAlmostEqual(values[Action.OPEN_LEFT], -45.0)
        self.assertAlmostEqual(values[Action.OPEN_RIGHT], -45.0)
```

- [ ] **Step 2: Run and verify failure**

Run `python -m unittest tests.test_solver -v`. Expected: missing solver import.

- [ ] **Step 3: Implement `tiger_game/solver.py`**

```python
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
            result[vector.action], vector.value_at(belief_left)
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
        action for action in Action
        if abs(values[action] - best) <= tolerance
    ]
```

- [ ] **Step 4: Run all tests**

Run `python -m unittest discover -s tests -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/solver.py tests/test_solver.py
git commit -m "feat: add exact finite-horizon solver"
```

## Task 5: Add a CLI

**Files:**
- Create: `tiger_game/cli.py`

- [ ] **Step 1: Add a failing CLI test**

Append:

```python
class CliTest(unittest.TestCase):
    def test_payload(self) -> None:
        from tiger_game.cli import solve_payload

        payload = solve_payload(1, 0.5, 0.85)
        self.assertEqual(payload["best_actions"], ["listen"])
        self.assertAlmostEqual(payload["value"], -1.0)
```

- [ ] **Step 2: Run and verify failure**

Run `python -m unittest tests.test_solver.CliTest -v`. Expected: import failure.

- [ ] **Step 3: Implement `tiger_game/cli.py`**

```python
from __future__ import annotations

import argparse
import json

from tiger_game.model import Action, TigerGame
from tiger_game.solver import TigerSolver, best_actions, q_values, value


def solve_payload(
    horizon: int, belief_left: float, p_correct: float
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
            action.value: q_by_action[action] for action in Action
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--horizon", type=int, default=1)
    parser.add_argument("--belief", type=float, default=0.5)
    parser.add_argument("--p-correct", type=float, default=0.85)
    args = parser.parse_args()
    print(json.dumps(
        solve_payload(args.horizon, args.belief, args.p_correct),
        indent=2,
        sort_keys=True,
    ))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run CLI and tests**

Run:

```powershell
python -m tiger_game.cli --horizon 1 --belief 0.5 --p-correct 0.85
python -m unittest discover -s tests -v
```

Expected: JSON has `best_actions: ["listen"]`, `value: -1.0`; all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/cli.py tests/test_solver.py
git commit -m "feat: add tiger game cli"
```
## Task 6: Add Parameter Sweeps and Segment Counting

**Files:**
- Create: `tiger_game/sweep.py`
- Create: `tests/test_sweep.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_sweep.py`:

```python
import unittest

from tiger_game.sweep import count_segments, sweep_probabilities


class SweepTest(unittest.TestCase):
    def test_sweep_rows(self) -> None:
        rows = sweep_probabilities([0.85, 0.70], [1, 2], 0.5)
        self.assertEqual(len(rows), 4)
        self.assertEqual({row["p_correct"] for row in rows}, {0.85, 0.70})

    def test_count_segments_is_positive(self) -> None:
        rows = sweep_probabilities([0.85], [1], 0.5)
        self.assertGreaterEqual(rows[0]["segments"], 1)
```

- [ ] **Step 2: Run and verify failure**

Run `python -m unittest tests.test_sweep -v`. Expected: missing module.

- [ ] **Step 3: Implement `tiger_game/sweep.py`**

```python
from __future__ import annotations

from tiger_game.alphas import AlphaVector
from tiger_game.model import TigerGame
from tiger_game.solver import TigerSolver, best_actions, value


def count_segments(vectors: list[AlphaVector]) -> int:
    points = {0.0, 1.0}
    lines = [
        (vector.values[0] - vector.values[1], vector.values[1])
        for vector in vectors
    ]
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
    return sum(1 for _ in zip(ordered, ordered[1:]))


def sweep_probabilities(
    probabilities: list[float], horizons: list[int], belief_left: float
) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for probability in probabilities:
        solver = TigerSolver(TigerGame(p_correct=probability))
        for horizon in horizons:
            vectors = solver.solve(horizon)
            rows.append({
                "p_correct": probability,
                "horizon": horizon,
                "belief_left": belief_left,
                "value": value(vectors, belief_left),
                "best_actions": [
                    action.value for action in best_actions(vectors, belief_left)
                ],
                "alpha_count": len(vectors),
                "segments": count_segments(vectors),
            })
    return rows
```

- [ ] **Step 4: Run tests**

Run `python -m unittest tests.test_sweep -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/sweep.py tests/test_sweep.py
git commit -m "feat: add parameter sweep utilities"
```

## Task 7: Validate One-Step Thresholds

**Files:**
- Create: `tests/test_one_step.py`

- [ ] **Step 1: Write independent analytic tests**

```python
import unittest

from tiger_game.model import Action, TigerGame
from tiger_game.solver import TigerSolver, best_actions, q_values, value


class OneStepAnalyticTest(unittest.TestCase):
    def setUp(self) -> None:
        self.vectors = TigerSolver(TigerGame(p_correct=0.85)).solve(1)

    def test_thresholds(self) -> None:
        self.assertAlmostEqual(q_values(self.vectors, 0.1)[Action.OPEN_LEFT], -1.0)
        self.assertAlmostEqual(q_values(self.vectors, 0.9)[Action.OPEN_RIGHT], -1.0)

    def test_regions(self) -> None:
        self.assertIn(Action.OPEN_LEFT, best_actions(self.vectors, 0.05))
        self.assertEqual(best_actions(self.vectors, 0.5), [Action.LISTEN])
        self.assertIn(Action.OPEN_RIGHT, best_actions(self.vectors, 0.95))

    def test_extremes(self) -> None:
        self.assertAlmostEqual(value(self.vectors, 0.0), 10.0)
        self.assertAlmostEqual(value(self.vectors, 1.0), 10.0)
```

- [ ] **Step 2: Run tests**

Run `python -m unittest tests.test_one_step -v`. Expected: all pass.

- [ ] **Step 3: Run full suite**

Run `python -m unittest discover -s tests -v`. Expected: all pass.

- [ ] **Step 4: Commit**

```powershell
git add tests/test_one_step.py
git commit -m "test: validate one-step thresholds"
```

## Task 8: Create README and First Experiment Output

**Files:**
- Create: `README.md`
- Create: `experiments/2026-09-15-first-run.json`

- [ ] **Step 1: Create `README.md`**

```markdown
# Tiger Game Exact Solver

Exact finite-horizon Tiger Game solver with 85% observation accuracy.

## Scope

- Two states.
- Open left, open right, listen.
- Exact alpha-vector backup.
- Finite horizons only.
- Soccer / Markov Game work is excluded.

## Quick Start

```powershell
python -m tiger_game.cli --horizon 1 --belief 0.5 --p-correct 0.85
```

Expected: `best_actions` is `["listen"]`, `value` is `-1.0`.

## Tests

```powershell
python -m unittest discover -s tests -v
```
```

- [ ] **Step 2: Generate the first result**

Run:

```powershell
python -m tiger_game.cli --horizon 1 --belief 0.5 --p-correct 0.85 > experiments/2026-09-15-first-run.json
```

- [ ] **Step 3: Verify the result**

Run `Get-Content experiments/2026-09-15-first-run.json`. Expected: `best_actions` contains `listen` and `value` is `-1.0`.

- [ ] **Step 4: Run all tests**

Run `python -m unittest discover -s tests -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add README.md experiments/2026-09-15-first-run.json
git commit -m "docs: add quick start and first experiment"
```

## Task 9: Run the Horizon Sweep and Record Results

**Files:**
- Create: `experiments/2026-09-15-horizon-sweep.json`

- [ ] **Step 1: Add a sweep command to `tiger_game/cli.py`**

Add an alternative `--sweep` flag:

```python
parser.add_argument("--sweep", action="store_true")
```

When `--sweep` is set, print:

```python
from tiger_game.sweep import sweep_probabilities

rows = sweep_probabilities(
    probabilities=[0.85, 0.70, 0.65],
    horizons=[1, 2, 3, 4],
    belief_left=0.5,
)
print(json.dumps(rows, indent=2, sort_keys=True))
```

- [ ] **Step 2: Run the sweep**

```powershell
python -m tiger_game.cli --sweep > experiments/2026-09-15-horizon-sweep.json
```

- [ ] **Step 3: Inspect alpha and segment growth**

Run:

```powershell
Get-Content experiments/2026-09-15-horizon-sweep.json
```

Expected: alpha count and segment count are recorded for each probability and horizon.

- [ ] **Step 4: Run all tests**

Run `python -m unittest discover -s tests -v`. Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tiger_game/cli.py experiments/2026-09-15-horizon-sweep.json
git commit -m "exp: record tiger horizon sweep"
```

## Task 10: Document the Research Sequence

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append the sequence**

```markdown
## Research Sequence

1. Validate one-step thresholds at 0.1 and 0.9.
2. Validate two-step value at belief 0.5 equals -2.0.
3. Sweep horizon and record alpha/segment growth.
4. Compare observation probabilities 0.85, 0.70, and 0.65.
5. Identify cases where segment count grows without convergence.
6. Only then generalize beyond two states.
```

- [ ] **Step 2: Run CLI at horizon two**

Run:

```powershell
python -m tiger_game.cli --horizon 2 --belief 0.5 --p-correct 0.85
```

Expected: best action is `listen`; value is `-2.0`.

- [ ] **Step 3: Run all tests**

Run `python -m unittest discover -s tests -v`. Expected: all pass.

- [ ] **Step 4: Commit**

```powershell
git add README.md
git commit -m "docs: define tiger research sequence"
```

## Final Verification

Run:

```powershell
python -m unittest discover -s tests -v
python -m tiger_game.cli --horizon 2 --belief 0.5 --p-correct 0.85
```

Expected:

- All tests pass.
- Horizon-two value is `-2.0`.
- Best action is `listen`.
- No soccer task appears in the implementation plan.

## Team Split

- Theory lead: verify alpha-vector backup and thresholds.
- Implementation lead: own model, alpha vectors, and solver.
- Verification lead: own tests and analytic checks.
- Documentation lead: own README and experiment logs.

## Definition of Done

- Exact finite-horizon values for the two-state Tiger Game.
- Correct 85% emission probability everywhere.
- One-step thresholds 0.1 and 0.9 covered by tests.
- Horizon-two center value covered by tests.
- Alpha and segment counts available for parameter sweeps.
- Soccer / Markov Game work excluded.