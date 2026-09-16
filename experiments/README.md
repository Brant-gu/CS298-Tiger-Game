# Tiger Game Experiments

## Reproduce

```powershell
python -m unittest discover -s tests -v
python -m tiger_game.cli --horizon 2 --belief 0.5 --p-correct 0.85
python -m tiger_game.cli --sweep > experiments/2026-09-15-horizon-sweep.json
```

## First Run

`2026-09-15-first-run.json` records horizon 1 at belief 0.5:

- Value: `-1.0`
- Best action: `listen`
- Alpha vectors: `3`

## Horizon Sweep

`2026-09-15-horizon-sweep.json` covers horizons 1-4 and observation probabilities 0.85, 0.70, and 0.65.

At belief 0.5, `listen` remains the best action in every recorded case. The segment and alpha counts grow quickly:

| Probability | Horizon | Alpha vectors | Segments | Value |
|---:|---:|---:|---:|---:|
| 0.85 | 1 | 3 | 3 | -1.0 |
| 0.85 | 2 | 7 | 5 | -2.0 |
| 0.85 | 3 | 11 | 7 | 2.72 |
| 0.85 | 4 | 9 | 6 | 2.42125 |
| 0.70 | 1 | 3 | 3 | -1.0 |
| 0.70 | 2 | 7 | 5 | -2.0 |
| 0.70 | 3 | 11 | 8 | -3.0 |
| 0.70 | 4 | 19 | 13 | -2.9 |
| 0.65 | 1 | 3 | 3 | -1.0 |
| 0.65 | 2 | 7 | 5 | -2.0 |
| 0.65 | 3 | 11 | 8 | -3.0 |
| 0.65 | 4 | 19 | 12 | -4.0 |

The counts are not monotone because pruning removes alpha vectors that are not part of the current upper envelope. The experiment logs the post-pruning count, which is the correct count for exact value computation.

## Next Experiments

- Extend horizons until runtime or alpha count becomes impractical.
- Record the maximum number of alpha vectors before and after pruning.
- Track threshold locations and best-action regions across horizons.
- Validate the known 0.85 two-signal behavior against the original Tiger paper.