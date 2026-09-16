# Tiger Game: Paper Verification Report

Date: 2026-09-15

Papers compared:

- Anthony R. Cassandra, Leslie Pack Kaelbling, and Michael L. Littman, *Acting Optimally in Partially Observable Stochastic Domains*, AAAI 1994.
- Leslie Pack Kaelbling, Michael L. Littman, and Anthony R. Cassandra, *Planning and Acting in Partially Observable Stochastic Domains*, Artificial Intelligence 101 (1998) 99-134, especially Section 5.

## Summary

The current implementation matches the paper on the core Tiger Game model and on the finite-horizon policy structure through four decision steps. The corrected 85% observation probability is confirmed by both papers.

One modeling mismatch was found and fixed: the paper specifies that opening a door is followed by either the LEFT or RIGHT observation with probability 0.5, while the first implementation used a single deterministic dummy observation. The two formulations are value-equivalent for the Tiger Game because both observations leave the belief unchanged at 0.5. The model now follows the paper literally.

## Model Comparison

| Item | Paper | Current implementation | Result |
|---|---|---|---|
| States | tiger left, tiger right | `State.LEFT`, `State.RIGHT` | Match |
| Actions | LEFT, RIGHT, LISTEN | `open_left`, `open_right`, `listen` | Match |
| Correct-door reward | +10 | `open_reward=10` | Match |
| Tiger-door penalty | -100 | `tiger_reward=-100` | Match |
| Listening cost | -1 | `listen_reward=-1` | Match |
| LISTEN transition | state does not change | identity transition | Match |
| OPEN transition | reset uniformly to left/right | uniform transition | Match |
| LISTEN observations | correct side 85%, incorrect 15% | `p_correct=0.85` | Match |
| OPEN observations | LEFT/RIGHT each with probability 0.5 | two observations, each with probability 0.5 | Match after correction |
| Finite-horizon objective | undiscounted reward sum | `discount=1.0` | Match |
| Open resets information | belief returns to 0.5 | Bayesian update returns 0.5 | Match |

## Finite-Horizon Verification

### One Decision

The paper states that each of the three actions is optimal for some belief state.

The implementation reproduces the analytic thresholds:

- `b < 0.1`: open left.
- `0.1 <= b <= 0.9`: listen.
- `b > 0.9`: open right.

At `b=0.5`, values are:

- open: `-45`
- listen: `-1`

This matches the paper's explanation that opening with no information is worse than listening.

### Two Decisions

The paper explicitly states that the two-step value function has five linear regions.

The implementation reports:

- `segments=5`
- `alpha_count=7`

The difference in those two counts is expected. Seven alpha vectors are tagged by action, but two of them duplicate value lines also represented by listening. There are only five distinct value lines, matching the paper's five regions.

The paper says the two-step policy trees all have LISTEN at the root. The implementation finds LISTEN as optimal at reachable beliefs `0.15`, `0.5`, and `0.85`. At the exact boundary beliefs `0` and `1`, opening and listening can tie; the paper chooses LISTEN as the representative optimal action.

### Three Decisions

The paper states that LISTEN is again the root action for all policy trees.

The implementation also selects LISTEN at the relevant interior beliefs. At exact certainty, open and LISTEN can tie.

Starting from belief 0.5, the known policy trace is:

1. LISTEN.
2. Hear LEFT: belief becomes 0.85.
3. LISTEN again.
4. Hear LEFT again: belief becomes about 0.9698.
5. OPEN RIGHT, because the tiger is now believed to be on the left.

If the signals are mixed, belief returns to 0.5 and the agent continues listening. This matches the paper's plan graph interpretation: keep listening until one side has been heard twice more than the other.

### Four Decisions and Later

The paper states that for horizons greater than three, some belief states choose an open action.

The implementation reproduces this:

- belief `0.5`: LISTEN.
- belief `0.05`: OPEN LEFT.
- belief `0.95`: OPEN RIGHT.

## Infinite-Horizon Verification

The paper's infinite-horizon plan graph has the following known structure:

- With 85% listening accuracy, listen until one side has been heard two more times than the other, then open.
- With 65% listening accuracy, the plan graph is larger and requires one side to be five observations ahead before opening.

The implementation verifies the Bayesian arithmetic behind those claims:

- 85% accuracy, two net correct signals: belief `0.9697986577`.
- 65% accuracy, five net correct signals: belief `0.9566941510`.

Both beliefs are above the one-step confidence threshold of 0.9.

The current solver is still finite-horizon. It has not yet independently reproduced the infinite-horizon plan graph or the paper's reported convergence around time steps 56-105. That remains the next verification task.

## Experimental Anomaly

The finite-horizon sweep showed:

- horizon 3 at belief 0.5: value `2.72`
- horizon 4 at belief 0.5: value `2.42125`

The paper does not publish these center values, so there is no direct numeric contradiction. A longer horizon is not guaranteed to increase an undiscounted finite-horizon value because the agent cannot choose a zero-reward STOP action. The extra required action can change belief or add a listening cost.

This anomaly should remain under review rather than being presented as a paper-confirmed result.

## Automated Benchmarks

`tests/test_paper_benchmarks.py` locks the following paper-based checks:

- Two-step value function has five linear regions.
- Two-step root action is LISTEN at reachable beliefs.
- 85% policy trace listens twice on the same side, then opens the opposite door.
- Mixed signals return belief to 0.5.
- Four-step policy opens for sufficiently confident beliefs.
- 65% accuracy requires five net signals to reach comparable confidence.

## Remaining Work

1. Add a discounted value-iteration or infinite-horizon plan-graph solver.
2. Reproduce the paper's stationary plan graph for 85% and 65% accuracy.
3. Verify convergence behavior and the reported time-step range 56-105.
4. Record the exact discount factor used in the paper's infinite-horizon experiment, if it is specified in the original source or associated code.
5. Update the experiment report to distinguish finite-horizon facts from infinite-horizon expectations.

## Evidence

- Paper model and finite-horizon discussion: Kaelbling et al., Section 5.1-5.2.
- Two-step five-region result: Kaelbling et al., Section 5.2, Figure 12.
- Four-step open actions: Kaelbling et al., Section 5.2, Figure 13.
- Infinite-horizon convergence: Kaelbling et al., Section 5.3, Figure 14.
- 85% two-signal plan graph: Kaelbling et al., Section 5.4, Figures 16-17.
- 65% five-signal result: Kaelbling et al., Section 5.4, Figure 18.