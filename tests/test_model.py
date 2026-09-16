import unittest

from tiger_game.model import Action, Observation, State, TigerGame


class TigerGameModelTest(unittest.TestCase):
    def setUp(self) -> None:
        self.game = TigerGame()

    def test_rewards(self) -> None:
        self.assertEqual(self.game.reward(State.LEFT, Action.OPEN_LEFT), -100.0)
        self.assertEqual(self.game.reward(State.RIGHT, Action.OPEN_LEFT), 10.0)
        self.assertEqual(self.game.reward(State.LEFT, Action.OPEN_RIGHT), 10.0)
        self.assertEqual(self.game.reward(State.RIGHT, Action.OPEN_RIGHT), -100.0)
        self.assertEqual(self.game.reward(State.LEFT, Action.LISTEN), -1.0)

    def test_listen_keeps_state(self) -> None:
        transition = self.game.transition(State.LEFT, Action.LISTEN)
        self.assertEqual(transition[State.LEFT], 1.0)
        self.assertEqual(transition[State.RIGHT], 0.0)

    def test_open_resets_state(self) -> None:
        transition = self.game.transition(State.LEFT, Action.OPEN_LEFT)
        self.assertEqual(transition[State.LEFT], 0.5)
        self.assertEqual(transition[State.RIGHT], 0.5)

    def test_observations(self) -> None:
        self.assertEqual(
            self.game.observations(Action.LISTEN),
            (Observation.HEAR_LEFT, Observation.HEAR_RIGHT),
        )
        self.assertEqual(
            self.game.observations(Action.OPEN_LEFT),
            (Observation.DUMMY,),
        )

    def test_85_percent_emissions(self) -> None:
        self.assertAlmostEqual(
            self.game.observation_probability(
                State.LEFT, Action.LISTEN, Observation.HEAR_LEFT
            ),
            0.85,
        )
        self.assertAlmostEqual(
            self.game.observation_probability(
                State.RIGHT, Action.LISTEN, Observation.HEAR_LEFT
            ),
            0.15,
        )


if __name__ == "__main__":
    unittest.main()