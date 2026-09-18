(() => {
  "use strict";

  const DATA = window.DASHBOARD_DATA;
  if (!DATA) return;

  const lang = new URLSearchParams(window.location.search).get("lang") === "zh" ? "zh" : "en";
  const TEXT = {
    en: {
      strategy: "Strategy Lab",
      dashboard: "Experiment Dashboard",
      title: "Experiment Dashboard",
      subtitle: "Exact finite-horizon Tiger Game metrics across decision horizons.",
      horizon: "Horizon",
      value: "Value at 50%",
      bestAction: "Best Action",
      rawAlpha: "Raw Alpha",
      prunedAlpha: "Pruned Alpha",
      lines: "Distinct Lines",
      segments: "Segments",
      runtime: "Runtime",
      valueChart: "Value vs Horizon",
      alphaChart: "Alpha Vectors vs Horizon",
      rawSeries: "Raw",
      prunedSeries: "Pruned",
      policyTitle: "Policy Regions over Belief",
      policyNote: "Background colors show the best action for each belief at the selected horizon.",
      listen: "LISTEN",
      openLeft: "OPEN LEFT",
      openRight: "OPEN RIGHT",
      tie: "TIE",
      tableTitle: "Experiment Runs",
      exportCsv: "Export CSV",
      run: "Run",
      status: "Status",
      paperMatch: "Paper Match",
      exploratory: "Exploratory"
    },
    zh: {
      strategy: "策略实验台",
      dashboard: "研究实验面板",
      title: "研究实验面板",
      subtitle: "比较不同决策期限下的 Tiger Game 精确指标。",
      horizon: "决策期限",
      value: "50% 信念价值",
      bestAction: "最优动作",
      rawAlpha: "剪枝前 Alpha",
      prunedAlpha: "剪枝后 Alpha",
      lines: "不同价值线",
      segments: "分段数量",
      runtime: "运行时间",
      valueChart: "价值随期限变化",
      alphaChart: "Alpha Vector 数量",
      rawSeries: "剪枝前",
      prunedSeries: "剪枝后",
      policyTitle: "信念区间策略",
      policyNote: "颜色表示当前期限下，不同信念对应的最优动作。",
      listen: "倾听",
      openLeft: "打开左门",
      openRight: "打开右门",
      tie: "平局",
      tableTitle: "实验运行表",
      exportCsv: "导出 CSV",
      run: "实验",
      status: "状态",
      paperMatch: "论文匹配",
      exploratory: "探索性"
    }
  };
  const t = (key) => TEXT[lang][key] || key;
  const ACTION_LABELS = {
    listen: t("listen"),
    open_left: t("openLeft"),
    open_right: t("openRight")
  };

  const dashboard = document.getElementById("dashboardView");
  const strategyPanels = [...document.querySelectorAll(".stage-panel,.insight-panel,.chart-panel,.log-panel")];
  const tabs = [...document.querySelectorAll("#viewTabs button")];
  let selectedHorizon = DATA.default_horizon;

  dashboard.innerHTML = [
    '<div class="dashboard-toolbar">',
    '  <div><span class="panel-index">DASH</span><h2>' + t("title") + '</h2><p>' + t("subtitle") + '</p></div>',
    '  <label class="dashboard-select"><span>' + t("horizon") + '</span><select id="dashboardHorizon"></select></label>',
    '</div>',
    '<div class="metric-grid" id="metricGrid"></div>',
    '<div class="dashboard-chart-grid">',
    '  <section class="dashboard-card"><h3>' + t("valueChart") + '</h3><div id="valueChart"></div></section>',
    '  <section class="dashboard-card"><h3>' + t("alphaChart") + '</h3><div id="alphaChart"></div></section>',
    '</div>',
    '<section class="dashboard-card policy-card"><h3>' + t("policyTitle") + '</h3><p>' + t("policyNote") + '</p><div class="policy-band" id="policyBand"></div><div class="policy-legend" id="policyLegend"></div></section>',
    '<section class="dashboard-card table-card"><div class="table-head"><h3>' + t("tableTitle") + '</h3><button type="button" id="exportCsv">' + t("exportCsv") + '</button></div><div class="table-wrap"><table id="experimentTable"></table></div></section>'
  ].join("");

  const horizonSelect = document.getElementById("dashboardHorizon");
  DATA.available_horizons.forEach((horizon) => {
    const option = document.createElement("option");
    option.value = String(horizon);
    option.textContent = String(horizon);
    if (horizon === selectedHorizon) option.selected = true;
    horizonSelect.appendChild(option);
  });

  function runForHorizon(horizon) {
    return DATA.runs.find((row) => row.parameters.horizon === horizon);
  }

  function valueAt(run, belief) {
    let best = -Infinity;
    for (const vector of run.alpha_vectors) {
      const score = belief * vector.values[0] + (1 - belief) * vector.values[1];
      if (score > best) best = score;
    }
    return best;
  }

  function bestActionsAt(run, belief) {
    const q = { listen: -Infinity, open_left: -Infinity, open_right: -Infinity };
    for (const vector of run.alpha_vectors) {
      const score = belief * vector.values[0] + (1 - belief) * vector.values[1];
      q[vector.action] = Math.max(q[vector.action], score);
    }
    const best = Math.max(q.listen, q.open_left, q.open_right);
    const actions = Object.keys(q).filter((action) => Math.abs(q[action] - best) <= 1e-8);
    if (actions.includes("listen")) return "listen";
    if (actions.length === 1) return actions[0];
    return "tie";
  }

  function metricCard(label, value) {
    return '<div class="metric-card"><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  function formatAction(action) {
    if (action === "listen") return ACTION_LABELS.listen;
    if (action === "open_left") return ACTION_LABELS.open_left;
    if (action === "open_right") return ACTION_LABELS.open_right;
    return t("tie");
  }

  function renderMetrics(run) {
    const m = run.metrics;
    document.getElementById("metricGrid").innerHTML = [
      metricCard(t("value"), m.value_at_belief.toFixed(3)),
      metricCard(t("bestAction"), formatAction(m.best_actions_at_belief[0])),
      metricCard(t("rawAlpha"), String(m.raw_alpha_count)),
      metricCard(t("prunedAlpha"), String(m.pruned_alpha_count)),
      metricCard(t("lines"), String(m.distinct_value_lines)),
      metricCard(t("segments"), String(m.segments)),
      metricCard(t("runtime"), m.runtime_ms.toFixed(2) + " ms")
    ].join("");
  }

  function renderSvgChart(targetId, series, yLabel) {
    const host = document.getElementById(targetId);
    const width = 720;
    const height = 300;
    const margin = { top: 24, right: 24, bottom: 42, left: 62 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const values = series.flatMap((item) => item.values);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const padding = (max - min) * 0.1;
    min -= padding;
    max += padding;
    const x = (index) => margin.left + index / (DATA.available_horizons.length - 1 || 1) * innerW;
    const y = (value) => margin.top + (max - value) / (max - min) * innerH;
    let parts = ['<svg viewBox="0 0 ' + width + ' ' + height + '" role="img">'];
    for (let i = 0; i <= 4; i += 1) {
      const value = max - i * (max - min) / 4;
      parts.push('<line x1="' + margin.left + '" x2="' + (width - margin.right) + '" y1="' + y(value) + '" y2="' + y(value) + '" stroke="rgba(242,234,216,.1)"/>');
      parts.push('<text x="' + (margin.left - 10) + '" y="' + (y(value) + 4) + '" fill="#8f968c" font-size="11" text-anchor="end">' + value.toFixed(1) + '</text>');
    }
    DATA.available_horizons.forEach((horizon, index) => {
      parts.push('<text x="' + x(index) + '" y="' + (height - 14) + '" fill="#8f968c" font-size="11" text-anchor="middle">' + horizon + '</text>');
    });
    series.forEach((item) => {
      const path = item.values.map((value, index) => (index === 0 ? "M" : "L") + " " + x(index) + " " + y(value)).join(" ");
      parts.push('<path d="' + path + '" fill="none" stroke="' + item.color + '" stroke-width="' + (item.thick ? 4 : 2.5) + '" stroke-linejoin="round"/>');
      item.values.forEach((value, index) => {
        parts.push('<circle cx="' + x(index) + '" cy="' + y(value) + '" r="4" fill="' + item.color + '" stroke="#0a0e0d" stroke-width="2"/>');
      });
    });
    parts.push('<text x="14" y="18" fill="#8f968c" font-size="11">' + yLabel + '</text>');
    parts.push('</svg>');
    host.innerHTML = parts.join("");
  }

  function renderCharts() {
    const valueSeries = [{
      color: "#f2ead8",
      thick: true,
      values: DATA.available_horizons.map((horizon) => runForHorizon(horizon).metrics.value_at_belief)
    }];
    renderSvgChart("valueChart", valueSeries, "VALUE");
    renderSvgChart("alphaChart", [
      { color: "#ffb000", values: DATA.available_horizons.map((horizon) => runForHorizon(horizon).metrics.raw_alpha_count) },
      { color: "#25c4ad", values: DATA.available_horizons.map((horizon) => runForHorizon(horizon).metrics.pruned_alpha_count) }
    ], "COUNT");
  }

  function renderPolicyBand(run) {
    const sampleCount = 200;
    const segments = [];
    let current = null;
    for (let index = 0; index < sampleCount; index += 1) {
      const belief = index / (sampleCount - 1);
      const action = bestActionsAt(run, belief);
      if (!current || current.action !== action) {
        current = { action: action, start: index, end: index };
        segments.push(current);
      } else {
        current.end = index;
      }
    }
    document.getElementById("policyBand").innerHTML = segments.map((segment) => {
      const width = (segment.end - segment.start + 1) / sampleCount * 100;
      const left = segment.start / sampleCount * 100;
      const label = formatAction(segment.action);
      return '<span class="policy-segment ' + segment.action + '" style="left:' + left + '%;width:' + width + '%" title="' + label + '">' + (width > 10 ? label : "") + '</span>';
    }).join("");
    document.getElementById("policyLegend").innerHTML = [
      '<span><i class="listen"></i>' + ACTION_LABELS.listen + '</span>',
      '<span><i class="open_left"></i>' + ACTION_LABELS.open_left + '</span>',
      '<span><i class="open_right"></i>' + ACTION_LABELS.open_right + '</span>',
      '<span><i class="tie"></i>' + t("tie") + '</span>'
    ].join("");
  }

  function renderTable() {
    const columns = [t("run"), t("horizon"), t("value"), t("bestAction"), t("rawAlpha"), t("prunedAlpha"), t("lines"), t("segments"), t("runtime"), t("status")];
    const rows = DATA.runs.map((run) => {
      const m = run.metrics;
      const status = run.validation.status === "paper_match" ? t("paperMatch") : t("exploratory");
      return [
        run.run_id,
        run.parameters.horizon,
        m.value_at_belief.toFixed(3),
        formatAction(m.best_actions_at_belief[0]),
        m.raw_alpha_count,
        m.pruned_alpha_count,
        m.distinct_value_lines,
        m.segments,
        m.runtime_ms.toFixed(2),
        status
      ];
    });
    let html = "<thead><tr>" + columns.map((column) => "<th>" + column + "</th>").join("") + "</tr></thead><tbody>";
    html += rows.map((row) => "<tr>" + row.map((cell) => "<td>" + cell + "</td>").join("") + "</tr>").join("");
    html += "</tbody>";
    document.getElementById("experimentTable").innerHTML = html;
  }

  function exportCsv() {
    const header = ["run_id", "accuracy", "horizon", "discount", "value_at_belief", "best_actions", "raw_alpha_count", "deduplicated_alpha_count", "pruned_alpha_count", "distinct_value_lines", "segments", "runtime_ms", "status"];
    const lines = [header.join(",")];
    DATA.runs.forEach((run) => {
      const m = run.metrics;
      lines.push([
        run.run_id,
        run.parameters.accuracy,
        run.parameters.horizon,
        run.parameters.discount,
        m.value_at_belief,
        '"' + m.best_actions_at_belief.join("|") + '"',
        m.raw_alpha_count,
        m.deduplicated_alpha_count,
        m.pruned_alpha_count,
        m.distinct_value_lines,
        m.segments,
        m.runtime_ms,
        run.validation.status
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tiger-experiments.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function render() {
    const run = runForHorizon(selectedHorizon);
    if (!run) return;
    renderMetrics(run);
    renderCharts();
    renderPolicyBand(run);
    renderTable();
  }

  horizonSelect.addEventListener("change", () => {
    selectedHorizon = Number(horizonSelect.value);
    render();
  });
  document.getElementById("exportCsv").addEventListener("click", exportCsv);

  function setView(view) {
    const dashboardVisible = view === "dashboard";
    strategyPanels.forEach((panel) => { panel.hidden = dashboardVisible; });
    dashboard.hidden = !dashboardVisible;
    tabs.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    if (dashboardVisible) render();
  }

  tabs[0].textContent = t("strategy");
  tabs[1].textContent = t("dashboard");
  tabs.forEach((button) => {
    button.addEventListener("click", () => {
      window.location.hash = button.dataset.view;
      setView(button.dataset.view);
    });
  });
  window.addEventListener("hashchange", () => setView(window.location.hash.slice(1) === "dashboard" ? "dashboard" : "strategy"));
  setView(window.location.hash.slice(1) === "dashboard" ? "dashboard" : "strategy");
})();
