# Tiger Game Exact Solver

Exact finite-horizon Tiger Game solver using alpha vectors and the corrected 85% observation probability.

## Scope

- Two states: tiger left and tiger right.
- Three actions: open left, open right, listen.
- Exact alpha-vector backup.
- Finite horizons only.
- Soccer / Markov Game work is excluded.

## Quick Start

```powershell
python -m tiger_game.cli --horizon 1 --belief 0.5 --p-correct 0.85
```

Expected: `best_actions` is `["listen"]` and `value` is `-1.0`.

## Research Sequence

1. Validate one-step thresholds at 0.1 and 0.9.
2. Validate two-step value at belief 0.5 equals -2.0.
3. Sweep horizon and record alpha/segment growth.
4. Compare observation probabilities 0.85, 0.70, and 0.65.
5. Identify cases where segment count grows without convergence.
6. Only then generalize beyond two states.

## Tests

```powershell
python -m unittest discover -s tests -v
```