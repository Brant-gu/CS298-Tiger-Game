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
## Paper Verification

The implementation is checked against the Tiger Game model and policy structure in the Cassandra/Kaelbling/Littman papers.

Run:

```powershell
python -m unittest tests.test_paper_benchmarks -v
```

See `docs/tiger-game-paper-verification.md`.

## Visualizer

The strategy visualizer lives in `visualization/`.

Regenerate its exact policy data:

```powershell
python -m scripts.export_visualization_data
```

Open it locally:

```powershell
python -m http.server 8765 --directory visualization
```

Then visit `http://127.0.0.1:8765/index.html`.

The page focuses on strategy intuition:

- live belief updates after LISTEN;
- Q values and the value-function envelope;
- manual and automatic policy execution;
- the paper's two-signal and five-signal policy benchmarks.