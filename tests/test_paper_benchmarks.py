import unittest

from tiger_game.belief import update_belief
from tiger_game.model import Action, Observation, TigerGame
from tiger_game.solver import TigerSolver, best_actions
from tiger_game.sweep import count_segments


class PaperBenchmarkTest(unittest.TestCase):
    def setUp(self) -> None:
        self.game = TigerGame(p_correct=0.85)
        self.solver = TigerSolver(self.game)

    def test_two_step_value_has_five_linear_regions(self) -> None:
        self.assertEqual(count_segments(self.solver.solve(2)), 5)

    def test_two_step_root_action_is_listen_at_reachable_beliefs(self) -> None:
        vectors = self.solver.solve(2)
        for belief in (0.15, 0.5, 0.85):
            self.assertIn(Action.LISTEN, best_actions(vectors, belief))

    def test_known_85_percent_policy_trace(self) -> None:
        self.assertIn(Action.LISTEN, best_actions(self.solver.solve(3), 0.5))

        belief = update_belief(
            0.5, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        self.assertAlmostEqual(belief, 0.85)
        self.assertIn(Action.LISTEN, best_actions(self.solver.solve(2), belief))

        belief = update_belief(
            belief, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        self.assertAlmostEqual(belief, 0.9697986577, places=8)
        self.assertIn(Action.OPEN_RIGHT, best_actions(self.solver.solve(1), belief))

    def test_mixed_signals_return_to_uncertainty(self) -> None:
        belief = update_belief(
            0.5, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        belief = update_belief(
            belief, Action.LISTEN, Observation.HEAR_RIGHT, self.game
        )
        self.assertAlmostEqual(belief, 0.5)
        self.assertIn(Action.LISTEN, best_actions(self.solver.solve(1), belief))

    def test_four_step_policy_opens_when_confident(self) -> None:
        vectors = self.solver.solve(4)
        self.assertIn(Action.LISTEN, best_actions(vectors, 0.5))
        self.assertIn(Action.OPEN_RIGHT, best_actions(vectors, 0.95))
        self.assertIn(Action.OPEN_LEFT, best_actions(vectors, 0.05))

    def test_65_percent_requires_five_net_signals(self) -> None:
        game = TigerGame(p_correct=0.65)
        belief = 0.5
        for _ in range(5):
            belief = update_belief(
                belief, Action.LISTEN, Observation.HEAR_LEFT, game
            )
        self.assertGreater(belief, 0.95)
        self.assertAlmostEqual(belief, 0.9566941510, places=8)


if __name__ == "__main__":
    unittest.main()