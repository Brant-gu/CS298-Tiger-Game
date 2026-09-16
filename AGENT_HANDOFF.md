# Agent Handoff: Fetch and Run CS298-Tiger-Game

This document is for another agent or collaborator who needs to obtain the complete project folder from GitHub.

## Repository

- GitHub: https://github.com/Brant-gu/CS298-Tiger-Game
- Visibility: Public
- Remote name: `origin`
- Current active branch: `feature/tiger-game-solver`
- Current default branch on GitHub: `feature/tiger-game-solver`

The repository is public, so cloning does not require an account or access token.

## Recommended Clone

Use HTTPS:

```powershell
git clone https://github.com/Brant-gu/CS298-Tiger-Game.git
cd CS298-Tiger-Game
git checkout feature/tiger-game-solver
git pull --ff-only
```

If the default branch is already `feature/tiger-game-solver`, the checkout command is still safe and explicit.

## GitHub CLI Alternative

```powershell
gh repo clone Brant-gu/CS298-Tiger-Game
cd CS298-Tiger-Game
git checkout feature/tiger-game-solver
```

## SSH Alternative

Use this only when the other agent has an SSH key configured for GitHub:

```powershell
git clone git@github.com:Brant-gu/CS298-Tiger-Game.git
cd CS298-Tiger-Game
git checkout feature/tiger-game-solver
```

## What the Repository Contains

```text
CS298-Tiger-Game/
├── tiger_game/          Python model, belief update, alpha-vector solver, CLI
├── tests/               Unit tests and paper-benchmark tests
├── experiments/         JSON experiment outputs and findings
├── visualization/       English/Chinese strategy visualizer
├── scripts/             Data export helpers
├── docs/                Design documents and paper verification
├── README.md            Quick start and project scope
└── pyproject.toml       Python project metadata
```

Key files:

- `tiger_game/model.py`: Tiger Game rewards, transitions, and observations.
- `tiger_game/belief.py`: Bayesian belief updates.
- `tiger_game/solver.py`: exact finite-horizon alpha-vector solver.
- `tiger_game/visualization_data.py`: exports exact policy data for the web page.
- `visualization/index.html`: strategy visualizer.
- `docs/tiger-game-paper-verification.md`: comparison against the original papers.

## Environment

Required:

- Python 3.11 or newer.

No third-party Python packages are required for the core solver or tests.

Node.js is not required to use the Python solver. It is only useful for JavaScript syntax checks of the visualizer.

## Verify the Checkout

From the repository root:

```powershell
python -m unittest discover -s tests -v
```

Expected result:

- 31 tests pass.
- No external package installation is needed.

Run a solver example:

```powershell
python -m tiger_game.cli --horizon 2 --belief 0.5 --p-correct 0.85
```

Expected key values:

- Best action: `listen`
- Value: `-2.0`
- Q values:
  - listen: `-2.0`
  - open left: `-46.0`
  - open right: `-46.0`

## Run the Visualizer

Regenerate the exact policy data:

```powershell
python scripts/export_visualization_data.py
```

Start a local static server:

```powershell
python -m http.server 8765 --directory visualization
```

Open:

- English: http://127.0.0.1:8765/index.html?lang=en
- Chinese: http://127.0.0.1:8765/index.html?lang=zh

## Important Scope

The current project focuses on the two-state finite-horizon Tiger Game.

Included:

- LISTEN, OPEN LEFT, OPEN RIGHT.
- Rewards +10 / -100 / -1.
- 85%, 70%, and 65% listening accuracy.
- Exact alpha-vector policy data for horizons 1 through 4.
- English and Chinese visualization.

Excluded:

- Soccer or Markov Game work.
- General POMG solving.
- Full infinite-horizon plan-graph extraction.

## Current Verification Status

Reproduced from the papers:

- Reward and transition model.
- 85% observation model.
- One-step 10% and 90% thresholds.
- Five linear regions for the two-step value function.
- The 85% policy of listening until one side is two signals ahead.
- The five-net-signal confidence calculation for 65% accuracy.

Not yet fully reproduced:

- The complete infinite-horizon plan graph.
- The paper's long-horizon convergence around time steps 56 to 105.
- The exact infinite-horizon discount factor and numerical convergence experiment.

See `docs/tiger-game-paper-verification.md` before making claims about full reproduction.

## Update the Local Copy

```powershell
git fetch origin
git checkout feature/tiger-game-solver
git pull --ff-only
```

Check the exact revision:

```powershell
git rev-parse HEAD
```

## Notes About Ignored Files

The repository `.gitignore` excludes PDF files. Large local papers and lecture notes in the original working directory are not part of the Git repository unless explicitly added later.

The source PDFs include:

- `AAAI94-157_TigerGame.pdf`
- `aij98-pomdp.pdf`
- `Persuasion_Notes_2.pdf`
- `CS298_Notes_0.pdf`

These can be requested separately if the new agent needs to inspect the original documents.
