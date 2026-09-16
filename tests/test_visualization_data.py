import unittest

from tiger_game.visualization_data import build_visualization_payload


class VisualizationDataTest(unittest.TestCase):
    def test_payload_contains_policy_grid(self) -> None:
        payload = build_visualization_payload()
        self.assertEqual(payload["probabilities"], [0.85, 0.70, 0.65])
        self.assertEqual(payload["horizons"], [1, 2, 3, 4])
        for probability in payload["probabilities"]:
            for horizon in payload["horizons"]:
                key = f"{probability:.2f}:{horizon}"
                self.assertIn(key, payload["policies"])
                self.assertGreater(len(payload["policies"][key]), 0)

    def test_two_step_policy_is_available(self) -> None:
        payload = build_visualization_payload()
        vectors = payload["policies"]["0.85:2"]
        self.assertGreaterEqual(len(vectors), 5)
        self.assertTrue(any(vector["action"] == "listen" for vector in vectors))


if __name__ == "__main__":
    unittest.main()