import unittest

from tiger_game.alphas import AlphaVector, prune_alpha_vectors
from tiger_game.model import Action


class AlphaVectorTest(unittest.TestCase):
    def test_value_at_belief(self) -> None:
        alpha = AlphaVector((10.0, -100.0), Action.OPEN_LEFT)
        self.assertAlmostEqual(alpha.value_at(0.0), -100.0)
        self.assertAlmostEqual(alpha.value_at(0.5), -45.0)
        self.assertAlmostEqual(alpha.value_at(1.0), 10.0)

    def test_remove_dominated(self) -> None:
        strong = AlphaVector((10.0, 10.0), Action.LISTEN)
        weak = AlphaVector((9.0, 9.0), Action.LISTEN)
        self.assertEqual(prune_alpha_vectors([strong, weak]), [strong])

    def test_keep_all_one_step_actions(self) -> None:
        vectors = [
            AlphaVector((-100.0, 10.0), Action.OPEN_LEFT),
            AlphaVector((10.0, -100.0), Action.OPEN_RIGHT),
            AlphaVector((-1.0, -1.0), Action.LISTEN),
        ]
        result = prune_alpha_vectors(vectors)
        self.assertEqual({vector.action for vector in result}, set(Action))


if __name__ == "__main__":
    unittest.main()

from tiger_game.model import TigerGame
from tiger_game.solver import TigerSolver, best_actions, q_values, value


class TigerSolverTest(unittest.TestCase):
    def setUp(self) -> None:
        self.solver = TigerSolver(TigerGame(p_correct=0.85))

    def test_horizon_one(self) -> None:
        vectors = self.solver.solve(1)
        self.assertEqual(len(vectors), 3)
        self.assertEqual(best_actions(vectors, 0.5), [Action.LISTEN])
        self.assertAlmostEqual(value(vectors, 0.1), -1.0)
        self.assertAlmostEqual(value(vectors, 0.9), -1.0)

    def test_horizon_two_center_value(self) -> None:
        self.assertAlmostEqual(value(self.solver.solve(2), 0.5), -2.0)

    def test_q_values_at_center(self) -> None:
        values = q_values(self.solver.solve(1), 0.5)
        self.assertAlmostEqual(values[Action.LISTEN], -1.0)
        self.assertAlmostEqual(values[Action.OPEN_LEFT], -45.0)
        self.assertAlmostEqual(values[Action.OPEN_RIGHT], -45.0)


class CliTest(unittest.TestCase):
    def test_payload(self) -> None:
        from tiger_game.cli import solve_payload

        payload = solve_payload(1, 0.5, 0.85)
        self.assertEqual(payload["best_actions"], ["listen"])
        self.assertAlmostEqual(payload["value"], -1.0)