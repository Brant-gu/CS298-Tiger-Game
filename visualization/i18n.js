(() => {
  "use strict";

  const PAIRS = [
    ["老虎在听", "The Tiger Listens"],
    ["。", "."],
    ["本回合", "Episode"],
    ["分", "points"],
    ["在不确定性中，什么时候继续听，什么时候必须开门。", "When uncertainty speaks, when should you keep listening—and when must you open a door?"],
    ["当前信念", "Belief"],
    ["剩余决策", "Decisions Left"],
    ["累计得分", "Total Score"],
    ["两道门", "Two Doors"],
    ["此刻该怎么选", "What Should You Do?"],
    ["价值函数全景", "Value Function Landscape"],
    ["决策轨迹", "Decision Trace"],
    ["等待动作", "Waiting"],
    ["参数已更新", "Parameters updated"],
    ["期限已更新", "Horizon updated"],
    ["已重开", "Reset"],
    ["得分已清零", "Score cleared"],
    ["回合结束，准备下一局", "Round complete · next episode"],
    ["左门", "Left door"],
    ["右门", "Right door"],
    ["未知", "Unknown"],
    ["老虎", "Tiger"],
    ["宝箱", "Treasure"],
    ["老虎更可能在左", "Tiger likely on left"],
    ["老虎更可能在右", "Tiger likely on right"],
    ["倾听", "Listen"],
    ["支付 -1，获得信号", "Pay -1 and receive a signal"],
    ["打开左门", "Open Left"],
    ["打开右门", "Open Right"],
    ["正确 +10 / 错误 -100", "Correct +10 / Wrong -100"],
    ["听音准确率", "Listening Accuracy"],
    ["决策期限", "Decision Horizon"],
    ["自动走一步", "Auto Step"],
    ["连续播放", "Auto Play"],
    ["暂停播放", "Pause"],
    ["重开", "Reset"],
    ["清零得分", "Clear Score"]
  ];  PAIRS.push(
    ["不确定", "Uncertain"],
    ["偏向右侧", "Leaning Right"],
    ["偏向左侧", "Leaning Left"],
    ["高置信", "High Confidence"],
    ["建议动作", "Recommended Action"],
    ["继续倾听", "Keep Listening"],
    ["本回合已结束", "Episode Complete"],
    ["门已经打开，下一局会自动重新开始。", "The door has been opened. The next episode starts automatically."],
    ["本回合信号", "Signals This Episode"],
    ["还没有听到信号", "No signals yet"],
    ["论文基准", "Paper Benchmarks"],
    ["85% 准确率：", "85% accuracy:"],
    ["65% 准确率：", "65% accuracy:"],
    ["两期价值函数：", "Two-step value function:"],
    ["同一边连续领先两次，信念约 96.98%，然后开另一扇门。", "two net correct signals raise belief to about 96.98%, then open the opposite door."],
    ["需要同一边领先五次，信念约 95.67%。", "five net correct signals are needed, raising belief to about 95.67%."],
    ["恰好由五个线性区域组成。", "exactly five linear regions."],
    ["横轴是“老虎在左边”的当前信念。粗线是价值函数，细线是各动作的 Q 值；虚线标出论文中的 10% 与 90% 临界点。", "The x-axis is the current belief that the tiger is on the left. The thick line is the value function; thin lines are action Q-values. Dashed lines mark the paper’s 10% and 90% thresholds."],
    ["点击“倾听”或“打开门”，这里会解释每一步为什么这样选择。", "Press Listen or Open a door. This panel will explain why each step matters."],
    ["本回合 ", "Episode "],
    [" 分", " points"],
    ["听到左边", "Heard left"],
    ["听到右边", "Heard right"],
    ["左", "L"],
    ["右", "R"]
  );

  const EXACT = new Map(PAIRS);
  const sourceMap = new WeakMap();
  let language = "en";

  function translateCore(core) {
    if (EXACT.has(core)) return EXACT.get(core);
    let match = core.match(/^正确｜(.+) 分$/);
    if (match) return `Correct · ${match[1]} points`;
    match = core.match(/^错误｜(.+) 分$/);
    if (match) return `Wrong · ${match[1]} points`;
    match = core.match(/^在 (.+)% 时选择倾听。听到“(.+)”后，信念更新为 (.+)%。$/);
    if (match) return `At ${match[1]}% belief, choose LISTEN. Hearing “${match[2]}” updates belief to ${match[3]}%.`;
    match = core.match(/^在 (.+)% 时打开([左右])门，结果(正确|错误)，获得 (.+) 分。$/);
    if (match) {
      const side = match[2] === "左" ? "left" : "right";
      const result = match[3] === "正确" ? "correct" : "incorrect";
      return `At ${match[1]}% belief, open the ${side} door. The result is ${result}; reward is ${match[4]} points.`;
    }
    match = core.match(/^当前只有 (.+)% 的偏向，继续听一次的信息价值高于立即冒险。$/);
    if (match) return `The bias is only ${match[1]}%. One more signal is worth more than taking the risk now.`;
    match = core.match(/^当前认为老虎在右边的把握约为 (.+)%，开门期望值最高。$/);
    if (match) return `You are about ${match[1]}% sure the tiger is on the right, so opening left has the highest expected value.`;
    match = core.match(/^当前认为老虎在左边的把握约为 (.+)%，开门期望值最高。$/);
    if (match) return `You are about ${match[1]}% sure the tiger is on the left, so opening right has the highest expected value.`;
    return core;
  }

  function translateTextNode(node) {
    if (!node.parentElement) return;
    if (node.parentElement.closest("#languageControl")) return;
    const tag = node.parentElement.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    const raw = node.nodeValue;
    const leading = raw.match(/^s*/)[0];
    const trailing = raw.match(/s*$/)[0];
    const core = raw.trim();
    if (!core) return;
    if (language === "en") {
      if (!sourceMap.has(node) && /[一-鿿]/.test(core)) sourceMap.set(node, raw);
      const translated = translateCore(core);
      if (translated !== core) node.nodeValue = leading + translated + trailing;
    } else if (sourceMap.has(node)) {
      node.nodeValue = sourceMap.get(node);
    }
  }

  function walk(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      translateTextNode(node);
      node = walker.nextNode();
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target);
      } else {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) walk(node);
        });
      }
    }
  });

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = language === "zh" ? "老虎游戏策略实验台" : "Tiger Game Strategy Lab";
    document.querySelectorAll("#languageControl a").forEach((button) => {
      button.classList.toggle("active", button.dataset.language === language);
    });
    walk(document.body);
  }


  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setLanguage(new URLSearchParams(window.location.search).get("lang") === "zh" ? "zh" : "en");
})();
