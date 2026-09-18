import unittest

from tiger_game.experiment_runner import build_dashboard_payload, run_experiments


class ExperimentRunnerTest(unittest.TestCase):
    def test_mvp_experiment_grid(self) -> None:
        rows = run_experiments(
            probabilities=[0.85],
            horizons=[1, 2, 3, 4, 5, 6],
            belief_left=0.5,
            git_commit='test-commit',
        )
        self.assertEqual(len(rows), 6)
        self.assertEqual([row['parameters']['horizon'] for row in rows], [1, 2, 3, 4, 5, 6])
        self.assertEqual({row['parameters']['accuracy'] for row in rows}, {0.85})
        for row in rows:
            self.assertIn('metrics', row)
            self.assertIn('alpha_vectors', row)
            self.assertEqual(
                len(row['alpha_vectors']),
                row['metrics']['pruned_alpha_count'],
            )

    def test_dashboard_payload(self) -> None:
        payload = build_dashboard_payload(
            probabilities=[0.85],
            horizons=[1, 2],
            belief_left=0.5,
            git_commit='test-commit',
        )
        self.assertEqual(payload['default_accuracy'], 0.85)
        self.assertEqual(payload['default_horizon'], 2)
        self.assertEqual(len(payload['runs']), 2)
