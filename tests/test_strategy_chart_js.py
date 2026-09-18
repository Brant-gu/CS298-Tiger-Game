import unittest
from pathlib import Path


class StrategyChartInteractionTest(unittest.TestCase):
    def test_chart_region_count_and_tooltip_markup(self) -> None:
        html = Path("visualization/index.html").read_text(encoding="utf-8")
        self.assertIn('id="linearRegionCount"', html)
        self.assertIn('id="valueChartTooltip"', html)

    def test_chart_interaction_logic_exists(self) -> None:
        script = Path("visualization/app.js").read_text(encoding="utf-8")
        self.assertIn("function countLinearRegions", script)
        self.assertIn('addEventListener("mousemove"', script)
        self.assertIn("valueChartTooltip", script)


if __name__ == "__main__":
    unittest.main()
