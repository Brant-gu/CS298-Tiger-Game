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


if __name__ == "__main__":
    unittest.main()