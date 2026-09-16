# Tiger Game Strategy Visualizer Design

## Goal

Build a static single-page visual experiment that makes the Tiger Game strategy intuitive to inspect. The page should answer three questions at a glance:

1. What does the player currently believe?
2. Which action is optimal now, and why?
3. How does the optimal value function change with belief, horizon, and listening accuracy?

## Audience and Use Case

Primary use is live discussion or presentation. The page is not a general research dashboard. It should privilege narrative clarity and immediate visual feedback over raw table density.

## Experience

The page uses a dark signal-instrument aesthetic: warm amber for danger and treasure, teal for information, and off-white typography. The main interaction is a two-door stage with a live belief instrument and a value-function chart.

The first viewport contains:

- A two-door Tiger Game stage.
- Current belief that the tiger is on the left.
- Remaining decision steps.
- Buttons for LISTEN, OPEN LEFT, OPEN RIGHT, AUTO STEP, and RESET.
- A concise recommendation explaining the current action.

Below or beside the stage:

- Q-value and V-value line chart over belief 0 to 1.
- Current belief marker.
- Fixed last-step thresholds at 0.1 and 0.9.
- Signal history from the current episode.
- A compact paper-benchmark panel explaining the known 85% and 65% policies.

## Controls

- Listening accuracy: 85%, 70%, or 65%.
- Horizon: 1, 2, 3, or 4 decisions.
- Manual game actions: listen, open left, open right.
- Automatic policy execution: one step or continuous playback.
- Reset episode and reset cumulative score.

Changing accuracy or horizon resets the current episode.

## Data and Computation

The Python solver remains the source of truth. It exports alpha vectors for each accuracy/horizon combination into `visualization/data.js`.

The browser:

- Evaluates alpha vectors at the current belief to obtain Q values and V.
- Updates belief after LISTEN using the 85/15 emission model.
- Simulates the hidden tiger state for the visual episode.
- Selects actions from exported exact policies for AUTO STEP.

No Python server or network connection is required.

## Visual Components

### Door Stage

- Left and right door panels.
- Door action probabilities shown as arrows or highlights.
- Tiger and treasure revealed only after an OPEN action.
- Reward animation after each opening.

### Belief Instrument

- Horizontal belief scale from tiger-left to tiger-right.
- Marker at current posterior.
- Threshold bands for the last-step open regions.
- Textual confidence label: uncertain, leaning left, leaning right, confident.

### Value Chart

- Belief on the x-axis from 0 to 1.
- Value on the y-axis.
- Three thin Q lines: open left, open right, listen.
- Thick V envelope.
- Vertical current-belief marker.
- Background color bands reflecting the current best action.

### Strategy Log

- Each action with the signal, updated belief, Q values, and reason.
- Maximum of the most recent six steps shown.
- Paper trace example: LISTEN, LISTEN same side, OPEN opposite side.

### Paper Benchmark Strip

- 85%: two net correct signals produce about 96.98% confidence.
- 65%: five net correct signals produce about 95.67% confidence.
- Horizon 2 has five distinct linear value regions.
- Four-step policy opens when sufficiently confident.

## Scope

Included:

- Tiger Game only.
- Two states and three actions.
- Finite horizons 1-4.
- Accuracies 85%, 70%, and 65%.
- Exact precomputed policies.
- Local static rendering.

Excluded:

- Soccer or Markov Game content.
- General POMG editing.
- Backend APIs.
- User accounts or persistence.
- Arbitrary reward editing in the first version.

## Acceptance Criteria

- The page opens locally without a build step or server.
- The belief marker updates correctly after every listening signal.
- The displayed best action matches the exported Python solver policy.
- Manual OPEN resets the episode after revealing the outcome.
- AUTO STEP follows the exact finite-horizon policy.
- The value chart shows Q lines, V envelope, thresholds, and current belief.
- The 85% two-signal and 65% five-signal paper facts are visible.
- The layout remains usable at desktop and mobile widths.
- No soccer content appears.

## Accessibility and Interaction

- Buttons are keyboard reachable.
- Color is supplemented by text labels.
- Motion can be reduced with `prefers-reduced-motion`.
- Belief value is always shown numerically.