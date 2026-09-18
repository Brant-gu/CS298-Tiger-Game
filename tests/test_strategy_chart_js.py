import unittest
from pathlib import Path


class StrategyChartInteractionTest(unittest.TestCase):
    def test_chart_region_count_and_tooltip_markup(self) -> None:
        html = Path("visualization/index.html").read_text(encoding="utf-8")
        self.assertIn('id="linearRegionCount"', html)
        self.assertIn('id="valueChartTooltip"', html)

    def test_chart_height_is_bounded(self) -> None:
        css = Path("visualization/styles.css").read_text(encoding="utf-8")
        self.assertIn("height: clamp(340px, 32vw, 520px)", css)
        self.assertIn("#valueChart", css)
        self.assertIn("height: 100%", css)

    def test_hover_region_index_logic_exists(self) -> None:
        script = Path("visualization/app.js").read_text(encoding="utf-8")
        self.assertIn("function getLinearRegions", script)
        self.assertIn("function regionIndexAt", script)
        self.assertIn("REGION", script)

    def test_chart_interaction_logic_exists(self) -> None:
        script = Path("visualization/app.js").read_text(encoding="utf-8")
        self.assertIn("function countLinearRegions", script)
        self.assertIn('addEventListener("mousemove"', script)
        self.assertIn("valueChartTooltip", script)


if __name__ == "__main__":
    unittest.main()
