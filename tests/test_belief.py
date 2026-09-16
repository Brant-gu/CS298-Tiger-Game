import unittest

from tiger_game.belief import update_belief
from tiger_game.model import Action, Observation, TigerGame


class BeliefUpdateTest(unittest.TestCase):
    def setUp(self) -> None:
        self.game = TigerGame(p_correct=0.85)

    def test_one_left_signal(self) -> None:
        value = update_belief(
            0.5, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        self.assertAlmostEqual(value, 0.85)

    def test_two_left_signals(self) -> None:
        first = update_belief(
            0.5, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        second = update_belief(
            first, Action.LISTEN, Observation.HEAR_LEFT, self.game
        )
        self.assertAlmostEqual(second, 0.9697986577, places=8)

    def test_open_resets_to_half(self) -> None:
        value = update_belief(
            0.95, Action.OPEN_LEFT, Observation.DUMMY, self.game
        )
        self.assertAlmostEqual(value, 0.5)


if __name__ == "__main__":
    unittest.main()