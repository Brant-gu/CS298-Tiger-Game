import unittest
from pathlib import Path


class DashboardJavaScriptTest(unittest.TestCase):
    def test_dashboard_chart_ids_are_namespaced(self) -> None:
        text = Path("visualization/dashboard.js").read_text(encoding="utf-8")
        self.assertIn('id="dashboardValueChart"', text)
        self.assertIn('renderSvgChart("dashboardValueChart"', text)
        self.assertIn('id="dashboardAlphaChart"', text)
        self.assertIn('renderSvgChart("dashboardAlphaChart"', text)
        self.assertNotIn('id="valueChart"', text)
        self.assertNotIn('renderSvgChart("valueChart"', text)
        self.assertIn('class="chart-key"', text)
        self.assertIn('t("rawSeries")', text)
        self.assertIn('t("prunedSeries")', text)


if __name__ == "__main__":
    unittest.main()
