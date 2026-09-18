import unittest

from tiger_game.model import TigerGame
from tiger_game.solver import TigerSolver


class SolverMetricsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.solver = TigerSolver(TigerGame(p_correct=0.85))

    def test_horizon_one_metrics(self) -> None:
        result = self.solver.solve_with_metrics(1)
        self.assertEqual(result.metrics.raw_alpha_count, 3)
        self.assertEqual(result.metrics.deduplicated_alpha_count, 3)
        self.assertEqual(result.metrics.pruned_alpha_count, 3)
        self.assertEqual(result.metrics.distinct_value_lines, 3)
        self.assertEqual(result.metrics.segments, 3)
        self.assertGreaterEqual(result.metrics.runtime_ms, 0.0)

    def test_horizon_two_metrics(self) -> None:
        result = self.solver.solve_with_metrics(2)
        self.assertEqual(result.metrics.raw_alpha_count, 27)
        self.assertGreaterEqual(
            result.metrics.deduplicated_alpha_count,
            result.metrics.pruned_alpha_count,
        )
        self.assertEqual(result.metrics.pruned_alpha_count, 7)
        self.assertEqual(result.metrics.distinct_value_lines, 5)
        self.assertEqual(result.metrics.segments, 5)
