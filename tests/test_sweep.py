import unittest

from tiger_game.sweep import count_segments, sweep_probabilities


class SweepTest(unittest.TestCase):
    def test_sweep_rows(self) -> None:
        rows = sweep_probabilities([0.85, 0.70], [1, 2], 0.5)
        self.assertEqual(len(rows), 4)
        self.assertEqual({row["p_correct"] for row in rows}, {0.85, 0.70})

    def test_count_segments_is_positive(self) -> None:
        rows = sweep_probabilities([0.85], [1], 0.5)
        self.assertGreaterEqual(rows[0]["segments"], 1)


if __name__ == "__main__":
    unittest.main()

class SweepCliTest(unittest.TestCase):
    def test_sweep_payload(self) -> None:
        from tiger_game.cli import sweep_payload

        rows = sweep_payload([0.85], [1], 0.5)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["best_actions"], ["listen"])
        self.assertAlmostEqual(rows[0]["value"], -1.0)

class SegmentCountTest(unittest.TestCase):
    def test_one_step_value_has_three_segments(self) -> None:
        from tiger_game.alphas import AlphaVector
        from tiger_game.model import Action
        from tiger_game.sweep import count_segments

        vectors = [
            AlphaVector((-100.0, 10.0), Action.OPEN_LEFT),
            AlphaVector((10.0, -100.0), Action.OPEN_RIGHT),
            AlphaVector((-1.0, -1.0), Action.LISTEN),
        ]
        self.assertEqual(count_segments(vectors), 3)