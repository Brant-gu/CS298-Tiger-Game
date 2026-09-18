# Experiment Dashboard Implementation Plan

Date: 2026-09-18

## Goal

Add a research-oriented experiment dashboard beside the existing strategy visualizer. The strategy tab explains intuition and policy; the experiment tab compares solver behavior across parameters, horizons, accuracy levels, and future algorithm variants.

The first version remains focused on the two-state Tiger Game and uses precomputed Python results. It should not require a backend service.

## Core Questions the Dashboard Must Answer

1. What happens to value and policy as horizon increases?
2. How quickly do alpha vectors and value-function segments grow?
3. How does runtime scale with horizon and accuracy?
4. Which results match the paper and which do not?
5. When does the solver stop converging or become numerically unstable?
6. How do exact and future approximate solvers differ?

## Page Structure

Add a top-level switch next to the language control:

- Strategy Lab
- Experiment Dashboard

The dashboard contains six sections:

1. Parameter controls.
2. Summary metric cards.
3. Growth charts.
4. Convergence charts.
5. Policy-region visualization.
6. Reproducible experiment table and export controls.

## 1. Parameter Controls

MVP controls:

- Listening accuracy: 0.85, 0.70, 0.65.
- Horizon range: start 1, end up to 6.
- Belief samples: 0.00 to 1.00, step 0.05.
- Reward preset: Paper standard.
- Solver mode: Exact alpha-vector.

Reserved for phase two:

- Discount factor.
- Custom treasure reward.
- Custom tiger penalty.
- Custom listening cost.
- Stochastic transition variants.
- General emission matrices.

Changing a control updates summary cards and charts from precomputed data. If the requested combination is missing, show a clear “not precomputed” state instead of running a hidden approximation.

## 2. Summary Metric Cards

For the selected accuracy and horizon show:

- Value at belief 0.5.
- Best action at belief 0.5.
- Alpha vectors before pruning.
- Alpha vectors after pruning.
- Distinct value lines.
- Number of value-function segments.
- Solve time in milliseconds.
- Validation status.

Validation status values:

- Paper match.
- Consistent but not directly stated in paper.
- Exploratory.
- Missing data.

## 3. Growth Charts

Chart A: Value vs horizon.

- One line per listening accuracy.
- X-axis: horizon.
- Y-axis: optimal value at belief 0.5.

Chart B: Alpha vectors vs horizon.

- One line per listening accuracy.
- Include raw generated count and post-pruning count when available.

Chart C: Distinct value lines and segments vs horizon.

- Show whether structural complexity grows, stabilizes, or fluctuates.

Chart D: Runtime vs horizon.

- Linear axis by default.
- Log axis when runtime range exceeds two orders of magnitude.

## 4. Convergence Charts

For exact finite-horizon results:

- Delta value between horizon t and t-1 at belief 0.5.
- Delta alpha count between horizon t and t-1.
- Delta segment count between horizon t and t-1.
- Threshold movement between horizons.

For future infinite-horizon or approximate solvers:

- Bellman residual.
- Maximum value change per iteration.
- Number of iterations.
- Whether two consecutive value functions are structurally identical.

## 5. Policy-Region Visualization

For the selected accuracy and horizon:

- Horizontal belief axis from 0 to 1.
- Colored bands showing best action:
  - LISTEN.
  - OPEN LEFT.
  - OPEN RIGHT.
  - tie regions.
- Mark belief 0.5.
- Mark last-step thresholds 0.1 and 0.9.
- Allow hovering to display Q values at any belief.
- Allow comparing two horizons side by side.

This is the most important visual for understanding whether policy structure is converging.

## 6. Experiment Table

Each row represents one run.

Required columns:

- Run ID.
- Listening accuracy.
- Horizon.
- Discount.
- Reward preset.
- Value at 0.5.
- Best action at 0.5.
- Raw alpha count.
- Pruned alpha count.
- Distinct lines.
- Segments.
- Runtime.
- Git commit.
- Validation label.

Controls:

- Sort by any column.
- Filter by accuracy, horizon, or status.
- Select two runs for side-by-side comparison.
- Export current table as CSV.
- Export selected run as JSON.

## Data Architecture

Recommended MVP architecture:

1. Python constructs a list of experiment records.
2. Records are written to `visualization/dashboard-data.js`.
3. Browser reads the static file and renders charts.
4. No backend, database, or package installation is required.

Recommended phase-two architecture:

1. Add a local FastAPI or standard-library HTTP API.
2. Frontend submits arbitrary solver parameters.
3. Server runs the exact solver in a background job.
4. Progress and cancellation are supported.
5. Static data remains the fallback for offline use.

## Experiment Record Schema

```json
{
  "run_id": "p085-h3-exact-r1",
  "parameters": {
    "accuracy": 0.85,
    "horizon": 3,
    "discount": 1.0,
    "reward_preset": "paper_standard",
    "solver_mode": "exact_alpha"
  },
  "metrics": {
    "value_at_half": 2.72,
    "best_actions_at_half": ["listen"],
    "raw_alpha_count": 49,
    "pruned_alpha_count": 11,
    "distinct_value_lines": 9,
    "segments": 7,
    "runtime_ms": 12.4
  },
  "validation": {
    "status": "paper_match",
    "notes": "Finite-horizon structure matches the paper."
  },
  "reproducibility": {
    "git_commit": "current HEAD",
    "python_version": "3.11+",
    "seed": null
  }
}
```

## Solver Instrumentation Required

Before dashboard implementation, add instrumentation to the solver:

- Count generated candidates before pruning.
- Count vectors after deduplication.
- Count vectors after envelope pruning.
- Count distinct value lines.
- Count segments.
- Record runtime in milliseconds.
- Record horizon, accuracy, discount, and reward preset.
- Record whether the result has a paper benchmark.

These metrics should be returned in a dedicated result object rather than printed by the CLI.

## Implementation Phases

### Phase 1: Instrumentation and Export

Deliverables:

- `SolverMetrics` data object.
- Batch experiment runner.
- Deterministic JSON output.
- Unit tests for counts and serialization.
- `visualization/dashboard-data.js`.

### Phase 2: Dashboard MVP

Deliverables:

- Strategy/Experiment tab switch.
- Parameter controls.
- Summary metric cards.
- Value, alpha, segment, and runtime charts.
- Policy-region bands.
- Experiment table.
- CSV export.
- English and Chinese labels.
- Mobile layout.

### Phase 3: Deeper Comparison

Deliverables:

- Custom rewards.
- Discount sweep.
- Random or asymmetric emission matrices.
- Compare exact and approximate solvers.
- Convergence and stability analysis.
- Paper-validation annotations.

### Phase 4: Live Solver

Deliverables:

- Local API.
- Run queue.
- Progress display.
- Cancellation.
- Cache keyed by parameter set and Git commit.
- Static fallback.

## File Structure

Proposed files:

- `tiger_game/metrics.py`
- `tiger_game/experiment_runner.py`
- `scripts/export_dashboard_data.py`
- `tests/test_metrics.py`
- `tests/test_experiment_runner.py`
- `visualization/dashboard.html`
- `visualization/dashboard.js`
- `visualization/dashboard.css`
- `visualization/dashboard-data.js`

The existing `index.html` can become the shell containing two tabs:

- Strategy Lab.
- Experiment Dashboard.

Alternatively, keep `index.html` for strategy and add `dashboard.html` linked from the header.

## MVP Acceptance Criteria

- Dashboard opens locally with no backend.
- Accuracy and horizon controls update all cards and charts.
- Raw and pruned alpha counts are visible.
- Segment growth is plotted for horizons 1 through 6.
- Runtime is measured and plotted.
- Policy regions are rendered on the belief interval.
- Paper benchmarks are visibly marked.
- Table is sortable and exportable as CSV.
- Missing data is shown explicitly.
- English is the default language.
- Chinese mode covers all dashboard labels.
- Existing 31 tests continue to pass.
- New instrumentation and runner tests pass.

## Risks and Constraints

- Exact alpha-vector count can grow rapidly.
- 65% accuracy at horizon 6 is already slow enough to require patience.
- Browser screenshot and export features must not block the UI.
- Benchmark runtime depends on machine load and Python version.
- Large precomputed datasets may increase repository size.
- Paper infinite-horizon claims must not be mixed with finite-horizon evidence.
- Dashboard must label exploratory results clearly.

## Recommended First Milestone

Implement only this vertical slice first:

1. Instrument solver metrics.
2. Export accuracy 0.85, horizons 1 through 6.
3. Add dashboard tab.
4. Show metric cards and two charts.
5. Add policy-region belt.
6. Add table with CSV export.

Do not add custom rewards or a live backend until this slice is verified.

## Definition of Done

The dashboard is done when a researcher can select an accuracy and horizon, immediately see value, policy, complexity, runtime, and convergence metrics, compare multiple runs, export the evidence, and identify which results are paper-verified versus exploratory.
