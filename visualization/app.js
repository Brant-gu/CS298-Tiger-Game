(() => {
  "use strict";

  const DATA = window.TIGER_DATA;
  if (!DATA) throw new Error("Tiger visualization data was not loaded.");

  const ACTIONS = ["listen", "open_left", "open_right"];
  const state = {
    accuracy: 0.85,
    horizon: 2,
    truth: null,
    belief: 0.5,
    remaining: 2,
    signals: [],
    logs: [],
    episodeScore: 0,
    cumulativeScore: 0,
    over: false,
    autoTimer: null,
    resetTimer: null,
  };

  const el = {
    headerBelief: document.getElementById("headerBelief"),
    headerSteps: document.getElementById("headerSteps"),
    headerScore: document.getElementById("headerScore"),
    episodeStatus: document.getElementById("episodeStatus"),
    doorLeft: document.getElementById("doorLeft"),
    doorRight: document.getElementById("doorRight"),
    leftGlyph: document.getElementById("leftGlyph"),
    rightGlyph: document.getElementById("rightGlyph"),
    leftDoorLabel: document.getElementById("leftDoorLabel"),
    rightDoorLabel: document.getElementById("rightDoorLabel"),
    beliefMarker: document.getElementById("beliefMarker"),
    beliefText: document.getElementById("beliefText"),
    confidenceChip: document.getElementById("confidenceChip"),
    recommendedAction: document.getElementById("recommendedAction"),
    recommendationReason: document.getElementById("recommendationReason"),
    qListen: document.getElementById("qListen"),
    qOpenLeft: document.getElementById("qOpenLeft"),
    qOpenRight: document.getElementById("qOpenRight"),
    qListenBar: document.getElementById("qListenBar"),
    qOpenLeftBar: document.getElementById("qOpenLeftBar"),
    qOpenRightBar: document.getElementById("qOpenRightBar"),
    qRows: [...document.querySelectorAll(".q-row")],
    signalHistory: document.getElementById("signalHistory"),
    strategyLog: document.getElementById("strategyLog"),
    episodeScore: document.getElementById("episodeScore"),
    accuracyControl: document.getElementById("accuracyControl"),
    horizonControl: document.getElementById("horizonControl"),
    listenButton: document.getElementById("listenButton"),
    openLeftButton: document.getElementById("openLeftButton"),
    openRightButton: document.getElementById("openRightButton"),
    autoStepButton: document.getElementById("autoStepButton"),
    autoPlayButton: document.getElementById("autoPlayButton"),
    resetButton: document.getElementById("resetButton"),
    resetScoreButton: document.getElementById("resetScoreButton"),
    valueChart: document.getElementById("valueChart"),
  };

  function randomSide() {
    return Math.random() < 0.5 ? "left" : "right";
  }

  function opposite(side) {
    return side === "left" ? "right" : "left";
  }

  function policyKey() {
    return `${state.accuracy.toFixed(2)}:${Math.max(1, state.remaining)}`;
  }

  function getVectors() {
    return DATA.policies[policyKey()] || [];
  }

  function evaluatePolicy(belief, vectors = getVectors()) {
    const q = { listen: -Infinity, open_left: -Infinity, open_right: -Infinity };
    for (const vector of vectors) {
      const [leftValue, rightValue] = vector.values;
      const score = belief * leftValue + (1 - belief) * rightValue;
      q[vector.action] = Math.max(q[vector.action], score);
    }
    const value = Math.max(...Object.values(q));
    const best = ACTIONS.filter((action) => Math.abs(q[action] - value) <= 1e-8);
    return { q, value, best };
  }

  function choosePolicyAction(result) {
    if (state.over || state.remaining <= 0) return null;
    if (result.best.includes("listen")) return "listen";
    if (result.best.length === 1) return result.best[0];
    return state.belief <= 0.5 ? "open_left" : "open_right";
  }

  function updateBelief(belief, signal) {
    const p = state.accuracy;
    const pSignalGivenLeft = signal === "left" ? p : 1 - p;
    const pSignalGivenRight = signal === "left" ? 1 - p : p;
    const numerator = belief * pSignalGivenLeft;
    const denominator = numerator + (1 - belief) * pSignalGivenRight;
    return denominator <= 0 ? 0.5 : numerator / denominator;
  }

  function drawSignal() {
    const correctSignal = state.truth;
    return Math.random() < state.accuracy ? correctSignal : opposite(correctSignal);
  }
  function addLog(entry) {
    state.logs.push(entry);
    state.logs = state.logs.slice(-6);
  }

  function setDoorsHidden() {
    el.leftGlyph.textContent = "?";
    el.rightGlyph.textContent = "?";
    el.leftDoorLabel.textContent = "未知";
    el.rightDoorLabel.textContent = "未知";
    el.doorLeft.className = "door door-left";
    el.doorRight.className = "door door-right";
    el.doorLeft.disabled = false;
    el.doorRight.disabled = false;
  }

  function resetEpisode(status = "等待动作") {
    window.clearTimeout(state.resetTimer);
    state.truth = randomSide();
    state.belief = 0.5;
    state.remaining = state.horizon;
    state.signals = [];
    state.logs = [];
    state.episodeScore = 0;
    state.over = false;
    el.episodeStatus.textContent = status;
    el.episodeStatus.classList.remove("live");
    setDoorsHidden();
    updateAll();
  }

  function revealDoors(openedSide, correct) {
    const leftHasTiger = state.truth === "left";
    el.leftGlyph.textContent = leftHasTiger ? "虎" : "宝";
    el.rightGlyph.textContent = leftHasTiger ? "宝" : "虎";
    el.leftDoorLabel.textContent = leftHasTiger ? "老虎" : "宝箱";
    el.rightDoorLabel.textContent = leftHasTiger ? "宝箱" : "老虎";
    const openedDoor = openedSide === "left" ? el.doorLeft : el.doorRight;
    openedDoor.classList.add(correct ? "reveal-correct" : "reveal-wrong");
  }

  function finishEpisode(message) {
    state.over = true;
    el.episodeStatus.textContent = message;
    el.episodeStatus.classList.add("live");
    el.doorLeft.disabled = true;
    el.doorRight.disabled = true;
    updateAll();
  }

  function actListen() {
    if (state.over || state.remaining <= 0) return;
    const before = state.belief;
    const beforePolicy = evaluatePolicy(before, getVectors());
    const signal = drawSignal();
    const after = updateBelief(before, signal);

    state.signals.push(signal);
    state.belief = after;
    state.remaining -= 1;
    state.episodeScore -= 1;

    addLog({
      action: "listen",
      signal,
      before,
      after,
      reward: -1,
      q: beforePolicy.q,
      text: `在 ${(before * 100).toFixed(1)}% 时选择倾听。听到“${signal === "left" ? "左边" : "右边"}”后，信念更新为 ${(after * 100).toFixed(1)}%。`,
    });

    el.episodeStatus.textContent = `听到${signal === "left" ? "左边" : "右边"}`;
    el.episodeStatus.classList.add("live");

    if (state.remaining <= 0) {
      finishEpisode("回合结束，准备下一局");
      state.resetTimer = window.setTimeout(() => resetEpisode("等待动作"), 1500);
    }
    updateAll();
  }

  function actOpen(side) {
    if (state.over || state.remaining <= 0) return;
    const correct = side !== state.truth;
    const reward = correct ? DATA.rewards.treasure : DATA.rewards.tiger;
    const before = state.belief;
    const beforePolicy = evaluatePolicy(before, getVectors());

    state.episodeScore += reward;
    state.cumulativeScore += reward;
    state.over = true;
    revealDoors(side, correct);

    addLog({
      action: side === "left" ? "open_left" : "open_right",
      signal: null,
      before,
      after: before,
      reward,
      q: beforePolicy.q,
      text: `在 ${(before * 100).toFixed(1)}% 时打开${side === "left" ? "左" : "右"}门，结果${correct ? "正确" : "错误"}，获得 ${reward > 0 ? "+" : ""}${reward} 分。`,
    });

    el.episodeStatus.textContent = `${correct ? "正确" : "错误"}｜${reward > 0 ? "+" : ""}${reward} 分`;
    el.episodeStatus.classList.add("live");
    el.doorLeft.disabled = true;
    el.doorRight.disabled = true;
    updateAll();
    state.resetTimer = window.setTimeout(() => resetEpisode("等待动作"), 1700);
  }

  function autoStep() {
    if (state.over || state.remaining <= 0) return;
    const result = evaluatePolicy(state.belief, getVectors());
    const action = choosePolicyAction(result);
    if (action === "listen") actListen();
    else if (action === "open_left") actOpen("left");
    else if (action === "open_right") actOpen("right");
  }
  function confidenceLabel(belief) {
    if (belief < 0.1 || belief > 0.9) return "高置信";
    if (belief < 0.4) return "偏向右侧";
    if (belief > 0.6) return "偏向左侧";
    return "不确定";
  }

  function recommendationCopy(action, belief) {
    if (action === "listen") {
      return {
        title: "继续倾听",
        reason: `当前只有 ${(Math.max(belief, 1 - belief) * 100).toFixed(1)}% 的偏向，继续听一次的信息价值高于立即冒险。`,
      };
    }
    if (action === "open_left") {
      return {
        title: "打开左门",
        reason: `当前认为老虎在右边的把握约为 ${((1 - belief) * 100).toFixed(1)}%，开门期望值最高。`,
      };
    }
    return {
      title: "打开右门",
      reason: `当前认为老虎在左边的把握约为 ${(belief * 100).toFixed(1)}%，开门期望值最高。`,
    };
  }

  function normalizeBars(q) {
    const values = ACTIONS.map((action) => q[action]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return {
      listen: ((q.listen - min) / span) * 100,
      open_left: ((q.open_left - min) / span) * 100,
      open_right: ((q.open_right - min) / span) * 100,
    };
  }

  function updateAll() {
    const vectors = getVectors();
    const result = evaluatePolicy(state.belief, vectors);
    const recommended = state.over ? null : choosePolicyAction(result);
    const bars = normalizeBars(result.q);

    el.headerBelief.textContent = `${(state.belief * 100).toFixed(1)}%`;
    el.headerSteps.textContent = String(Math.max(0, state.remaining));
    el.headerScore.textContent = String(state.cumulativeScore);
    el.episodeScore.textContent = String(state.episodeScore);
    el.beliefText.textContent = `${(state.belief * 100).toFixed(1)}% / ${((1 - state.belief) * 100).toFixed(1)}%`;
    el.beliefMarker.style.left = `${state.belief * 100}%`;
    el.confidenceChip.textContent = confidenceLabel(state.belief);

    el.qListen.textContent = result.q.listen.toFixed(2);
    el.qOpenLeft.textContent = result.q.open_left.toFixed(2);
    el.qOpenRight.textContent = result.q.open_right.toFixed(2);
    el.qListenBar.style.width = `${bars.listen}%`;
    el.qOpenLeftBar.style.width = `${bars.open_left}%`;
    el.qOpenRightBar.style.width = `${bars.open_right}%`;
    el.qRows.forEach((row) => row.classList.toggle("active", row.dataset.action === recommended));

    const copy = recommended ? recommendationCopy(recommended, state.belief) : {
      title: "本回合已结束",
      reason: "门已经打开，下一局会自动重新开始。",
    };
    el.recommendedAction.textContent = copy.title;
    el.recommendationReason.textContent = copy.reason;

    el.doorLeft.classList.toggle("recommended", recommended === "open_left");
    el.doorRight.classList.toggle("recommended", recommended === "open_right");
    el.doorLeft.disabled = state.over;
    el.doorRight.disabled = state.over;
    el.listenButton.disabled = state.over || state.remaining <= 0;
    el.openLeftButton.disabled = state.over || state.remaining <= 0;
    el.openRightButton.disabled = state.over || state.remaining <= 0;
    el.autoStepButton.disabled = state.over || state.remaining <= 0;
    el.autoPlayButton.textContent = state.autoTimer ? "暂停播放" : "连续播放";

    renderSignals();
    renderLog();
    renderChart(result);
  }

  function renderSignals() {
    if (state.signals.length === 0) {
      el.signalHistory.innerHTML = '<span class="empty-chip">还没有听到信号</span>';
      return;
    }
    el.signalHistory.innerHTML = state.signals
      .map((signal) => `<span class="signal-chip ${signal}">${signal === "left" ? "左" : "右"}</span>`)
      .join("");
  }

  function renderLog() {
    if (state.logs.length === 0) {
      el.strategyLog.innerHTML = '<li class="log-empty">点击“倾听”或“打开门”，这里会解释每一步为什么这样选择。</li>';
      return;
    }
    el.strategyLog.innerHTML = state.logs
      .slice()
      .reverse()
      .map((entry, index) => `
        <li>
          <div class="log-top">
            <strong>${String(state.logs.length - index).padStart(2, "0")} · ${entry.action === "listen" ? "LISTEN" : entry.action === "open_left" ? "OPEN LEFT" : "OPEN RIGHT"}</strong>
            <span class="log-reward ${entry.reward >= 0 ? "positive" : "negative"}">${entry.reward > 0 ? "+" : ""}${entry.reward}</span>
          </div>
          <div class="log-text">${entry.text}</div>
        </li>
      `)
      .join("");
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgNode(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      node.setAttribute(key, String(value));
    }
    return node;
  }

  function renderChart(currentResult) {
    const svg = el.valueChart;
    svg.innerHTML = "";
    const width = 1000;
    const height = 410;
    const margin = { top: 24, right: 28, bottom: 48, left: 72 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const samples = Array.from({ length: 101 }, (_, index) => index / 100);
    const evaluated = samples.map((belief) => ({ belief, ...evaluatePolicy(belief, getVectors()) }));
    const allValues = evaluated.flatMap((row) => Object.values(row.q));
    let yMin = Math.min(...allValues);
    let yMax = Math.max(...allValues);
    const padding = Math.max(5, (yMax - yMin) * 0.08);
    yMin -= padding;
    yMax += padding;
    if (yMax - yMin < 20) {
      const center = (yMax + yMin) / 2;
      yMin = center - 10;
      yMax = center + 10;
    }

    const x = (belief) => margin.left + belief * innerW;
    const y = (value) => margin.top + (yMax - value) / (yMax - yMin) * innerH;

    for (let index = 0; index < samples.length - 1; index += 1) {
      const row = evaluated[index];
      const next = evaluated[index + 1];
      const bandAction = row.best.includes("listen") ? "listen" : row.best[0];
      const nextAction = next.best.includes("listen") ? "listen" : next.best[0];
      if (bandAction !== nextAction) continue;
      const color = bandAction === "listen" ? "rgba(37,196,173,.055)" :
        bandAction === "open_left" ? "rgba(255,176,0,.055)" : "rgba(240,91,62,.055)";
      svg.appendChild(svgNode("rect", {
        x: x(row.belief),
        y: margin.top,
        width: x(next.belief) - x(row.belief) + 1,
        height: innerH,
        fill: color,
      }));
    }

    for (let tick = 0; tick <= 5; tick += 1) {
      const value = yMax - tick * (yMax - yMin) / 5;
      svg.appendChild(svgNode("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y(value),
        y2: y(value),
        stroke: "rgba(242,234,216,.09)",
        "stroke-width": 1,
      }));
      const label = svgNode("text", {
        x: margin.left - 12,
        y: y(value) + 4,
        fill: "#8f968c",
        "font-size": 11,
        "font-family": "Cascadia Mono, Consolas, monospace",
        "text-anchor": "end",
      });
      label.textContent = value.toFixed(0);
      svg.appendChild(label);
    }
    for (const belief of [0, 0.1, 0.5, 0.9, 1]) {
      svg.appendChild(svgNode("line", {
        x1: x(belief),
        x2: x(belief),
        y1: margin.top,
        y2: margin.top + innerH,
        stroke: belief === 0.1 || belief === 0.9 ? "rgba(223,191,109,.42)" : "rgba(242,234,216,.1)",
        "stroke-width": 1,
        "stroke-dasharray": belief === 0.1 || belief === 0.9 ? "5 5" : "",
      }));
      const label = svgNode("text", {
        x: x(belief),
        y: height - 17,
        fill: belief === 0.1 || belief === 0.9 ? "#dfbf6d" : "#8f968c",
        "font-size": 11,
        "font-family": "Cascadia Mono, Consolas, monospace",
        "text-anchor": "middle",
      });
      label.textContent = `${Math.round(belief * 100)}%`;
      svg.appendChild(label);
    }

    const linePath = (action) => evaluated
      .map((row, index) => `${index === 0 ? "M" : "L"} ${x(row.belief)} ${y(row.q[action])}`)
      .join(" ");

    const valuePath = evaluated
      .map((row, index) => `${index === 0 ? "M" : "L"} ${x(row.belief)} ${y(row.value)}`)
      .join(" ");

    const qLines = [
      ["listen", "#25c4ad"],
      ["open_left", "#ffb000"],
      ["open_right", "#f05b3e"],
    ];
    qLines.forEach(([action, color]) => {
      svg.appendChild(svgNode("path", {
        d: linePath(action),
        fill: "none",
        stroke: color,
        "stroke-width": 2,
        "stroke-opacity": 0.72,
      }));
    });

    svg.appendChild(svgNode("path", {
      d: valuePath,
      fill: "none",
      stroke: "#f2ead8",
      "stroke-width": 4,
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
    }));

    const markerX = x(state.belief);
    const markerY = y(currentResult.value);
    svg.appendChild(svgNode("line", {
      x1: markerX,
      x2: markerX,
      y1: margin.top,
      y2: margin.top + innerH,
      stroke: "#f2ead8",
      "stroke-width": 1,
      "stroke-opacity": 0.32,
    }));
    svg.appendChild(svgNode("circle", {
      cx: markerX,
      cy: markerY,
      r: 7,
      fill: "#f2ead8",
      stroke: "#0a0e0d",
      "stroke-width": 3,
    }));
    const markerLabel = svgNode("text", {
      x: Math.min(width - margin.right - 8, markerX + 10),
      y: Math.max(margin.top + 14, markerY - 12),
      fill: "#f2ead8",
      "font-size": 11,
      "font-family": "Cascadia Mono, Consolas, monospace",
    });
    markerLabel.textContent = `${(state.belief * 100).toFixed(1)}% → ${currentResult.value.toFixed(2)}`;
    svg.appendChild(markerLabel);
  }
  function stopAutoPlay() {
    if (state.autoTimer) {
      window.clearInterval(state.autoTimer);
      state.autoTimer = null;
      updateAll();
    }
  }

  function toggleAutoPlay() {
    if (state.autoTimer) {
      stopAutoPlay();
      return;
    }
    state.autoTimer = window.setInterval(autoStep, 1050);
    updateAll();
  }

  function bindSegmented(container, callback) {
    container.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;
      container.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      callback(Number(button.dataset.value));
    });
  }

  bindSegmented(el.accuracyControl, (value) => {
    state.accuracy = value;
    stopAutoPlay();
    resetEpisode("参数已更新");
  });

  bindSegmented(el.horizonControl, (value) => {
    state.horizon = value;
    stopAutoPlay();
    resetEpisode("期限已更新");
  });

  el.listenButton.addEventListener("click", actListen);
  el.openLeftButton.addEventListener("click", () => actOpen("left"));
  el.openRightButton.addEventListener("click", () => actOpen("right"));
  el.doorLeft.addEventListener("click", () => actOpen("left"));
  el.doorRight.addEventListener("click", () => actOpen("right"));
  el.autoStepButton.addEventListener("click", autoStep);
  el.autoPlayButton.addEventListener("click", toggleAutoPlay);
  el.resetButton.addEventListener("click", () => resetEpisode("已重开"));
  el.resetScoreButton.addEventListener("click", () => {
    state.cumulativeScore = 0;
    resetEpisode("得分已清零");
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "l") actListen();
    if (event.key.toLowerCase() === "a") actOpen("left");
    if (event.key.toLowerCase() === "d") actOpen("right");
    if (event.key === " ") {
      event.preventDefault();
      autoStep();
    }
  });

  resetEpisode("等待动作");
})();