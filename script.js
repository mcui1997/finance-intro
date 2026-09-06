(function () {
  "use strict";

  /* ---------- tab controller ---------- */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".step"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
    if (!tabs.length) return;

    function activate(idx, focusPanel) {
      idx = Math.max(0, Math.min(tabs.length - 1, idx));
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on) t.scrollIntoView({ block: "nearest", inline: "center" });
      });
      panels.forEach(function (p, i) { p.hidden = i !== idx; });
      if (history.replaceState) history.replaceState(null, "", "#step-" + (idx + 1));
      window.scrollTo({ top: 0, behavior: "auto" });
      if (focusPanel && panels[idx]) panels[idx].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(i, false); });
      t.addEventListener("keydown", function (e) {
        var last = tabs.length - 1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault(); var n = Math.min(last, i + 1); tabs[n].focus(); activate(n, false);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault(); var p = Math.max(0, i - 1); tabs[p].focus(); activate(p, false);
        } else if (e.key === "Home") {
          e.preventDefault(); tabs[0].focus(); activate(0, false);
        } else if (e.key === "End") {
          e.preventDefault(); tabs[last].focus(); activate(last, false);
        }
      });
    });

    document.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(parseInt(btn.getAttribute("data-goto"), 10) - 1, true);
      });
    });

    var m = location.hash.match(/step-(\d+)/);
    activate(m ? parseInt(m[1], 10) - 1 : 0, false);
  }

  /* ---------- mix visuals (dormant until steps 6 and 8 are filled) ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var css = getComputedStyle(document.documentElement);
  var COLORS = {
    stocks: css.getPropertyValue("--stocks").trim(),
    bonds: css.getPropertyValue("--bonds").trim(),
    gold: css.getPropertyValue("--gold").trim(),
    bitcoin: css.getPropertyValue("--bitcoin").trim()
  };
  var NAMES = { stocks: "Stocks", bonds: "Bonds", gold: "Gold", bitcoin: "Bitcoin" };
  var ORDER = ["stocks", "bonds", "gold", "bitcoin"];
  var BTC = { cautious: 5, balanced: 10, bold: 15 };

  function computeMix(risk, age) {
    var bitcoin = BTC[risk];
    var gold = 15;
    var bonds = Math.max(5, Math.min(40, age - 20));
    return { stocks: 100 - bitcoin - gold - bonds, bonds: bonds, gold: gold, bitcoin: bitcoin };
  }

  function donut(svg, mix, size, stroke) {
    if (!svg) return;
    var r = (size - stroke) / 2, c = 2 * Math.PI * r, cx = size / 2, cy = size / 2;
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var track = document.createElementNS(NS, "circle");
    track.setAttribute("cx", cx); track.setAttribute("cy", cy); track.setAttribute("r", r);
    track.setAttribute("fill", "none"); track.setAttribute("stroke", "#eaeee3"); track.setAttribute("stroke-width", stroke);
    svg.appendChild(track);
    var accLen = 0;
    ORDER.forEach(function (k) {
      var val = mix[k] || 0; if (val <= 0) return;
      var len = c * (val / 100);
      var seg = document.createElementNS(NS, "circle");
      seg.setAttribute("cx", cx); seg.setAttribute("cy", cy); seg.setAttribute("r", r);
      seg.setAttribute("fill", "none"); seg.setAttribute("stroke", COLORS[k]); seg.setAttribute("stroke-width", stroke);
      seg.setAttribute("stroke-dasharray", len + " " + (c - len));
      seg.setAttribute("stroke-dashoffset", -accLen);
      seg.setAttribute("transform", "rotate(-90 " + cx + " " + cy + ")");
      svg.appendChild(seg);
      accLen += len;
    });
  }

  function words(mix) {
    return ORDER.map(function (k) { return mix[k] + " percent " + NAMES[k].toLowerCase(); }).join(", ");
  }

  function buildPieLegend() {
    var el = document.getElementById("pieLegend"); if (!el) return;
    ORDER.forEach(function (k) {
      var s = document.createElement("span"), i = document.createElement("i");
      i.style.background = COLORS[k]; s.appendChild(i); s.appendChild(document.createTextNode(NAMES[k])); el.appendChild(s);
    });
  }

  function buildExamplePies() {
    document.querySelectorAll(".donut[data-mix]").forEach(function (svg) {
      donut(svg, computeMix(svg.getAttribute("data-mix"), 25), 160, 32);
    });
  }

  function buildRebalance() {
    donut(document.getElementById("rebalDrift"), { stocks: 60, bonds: 5, gold: 13, bitcoin: 22 }, 150, 30);
    donut(document.getElementById("rebalFixed"), computeMix("balanced", 25), 150, 30);
  }

  function buildTool() {
    var donutEl = document.getElementById("mixDonut");
    var legendEl = document.getElementById("mixLegend");
    var liveEl = document.getElementById("mixLive");
    var ageInput = document.getElementById("age");
    var ageOut = document.getElementById("ageOut");
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".risk"));
    if (!donutEl || !ageInput) return;
    var state = { risk: "balanced", age: 25 };

    function renderLegend(mix) {
      legendEl.innerHTML = "";
      ORDER.forEach(function (k) {
        var li = document.createElement("li"), i = document.createElement("i");
        i.style.background = COLORS[k];
        var name = document.createElement("span"); name.className = "lg-name"; name.textContent = NAMES[k];
        var val = document.createElement("span"); val.className = "lg-val"; val.textContent = mix[k] + "%";
        li.appendChild(i); li.appendChild(name); li.appendChild(val); legendEl.appendChild(li);
      });
    }
    function render() {
      var mix = computeMix(state.risk, state.age);
      donut(donutEl, mix, 220, 42);
      renderLegend(mix);
      liveEl.textContent = "A " + state.risk + " mix at age " + state.age + ": " + words(mix) + ".";
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        state.risk = b.getAttribute("data-risk");
        buttons.forEach(function (x) {
          var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-checked", on ? "true" : "false");
        });
        render();
      });
    });
    ageInput.addEventListener("input", function () {
      state.age = parseInt(ageInput.value, 10); ageOut.textContent = state.age; render();
    });
    render();
  }

  function init() {
    initTabs();
    buildPieLegend();
    buildExamplePies();
    buildRebalance();
    buildTool();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();