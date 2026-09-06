(function () {
  "use strict";

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
    var stocks = 100 - bitcoin - gold - bonds;
    return { stocks: stocks, bonds: bonds, gold: gold, bitcoin: bitcoin };
  }

  function donut(svg, mix, size, stroke) {
    if (!svg) return;
    var r = (size - stroke) / 2;
    var c = 2 * Math.PI * r;
    var cx = size / 2;
    var cy = size / 2;
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var track = document.createElementNS(NS, "circle");
    track.setAttribute("cx", cx);
    track.setAttribute("cy", cy);
    track.setAttribute("r", r);
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", "#eaeee3");
    track.setAttribute("stroke-width", stroke);
    svg.appendChild(track);

    var accLen = 0;
    ORDER.forEach(function (k) {
      var val = mix[k] || 0;
      if (val <= 0) return;
      var len = c * (val / 100);
      var seg = document.createElementNS(NS, "circle");
      seg.setAttribute("cx", cx);
      seg.setAttribute("cy", cy);
      seg.setAttribute("r", r);
      seg.setAttribute("fill", "none");
      seg.setAttribute("stroke", COLORS[k]);
      seg.setAttribute("stroke-width", stroke);
      seg.setAttribute("stroke-dasharray", len + " " + (c - len));
      seg.setAttribute("stroke-dashoffset", -accLen);
      seg.setAttribute("transform", "rotate(-90 " + cx + " " + cy + ")");
      svg.appendChild(seg);
      accLen += len;
    });
  }

  function words(mix) {
    return ORDER.map(function (k) {
      return mix[k] + " percent " + NAMES[k].toLowerCase();
    }).join(", ");
  }

  // shared legend under the three example pies
  function buildPieLegend() {
    var el = document.getElementById("pieLegend");
    if (!el) return;
    ORDER.forEach(function (k) {
      var s = document.createElement("span");
      var i = document.createElement("i");
      i.style.background = COLORS[k];
      s.appendChild(i);
      s.appendChild(document.createTextNode(NAMES[k]));
      el.appendChild(s);
    });
  }

  // the three static example donuts, drawn for age 25
  function buildExamplePies() {
    document.querySelectorAll(".donut[data-mix]").forEach(function (svg) {
      var risk = svg.getAttribute("data-mix");
      donut(svg, computeMix(risk, 25), 160, 32);
    });
  }

  // the rebalance before / after pair
  function buildRebalance() {
    donut(document.getElementById("rebalDrift"),
      { stocks: 60, bonds: 5, gold: 13, bitcoin: 22 }, 150, 30);
    donut(document.getElementById("rebalFixed"),
      computeMix("balanced", 25), 150, 30);
  }

  // the interactive builder
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
        var li = document.createElement("li");
        var i = document.createElement("i");
        i.style.background = COLORS[k];
        var name = document.createElement("span");
        name.className = "lg-name";
        name.textContent = NAMES[k];
        var val = document.createElement("span");
        val.className = "lg-val";
        val.textContent = mix[k] + "%";
        li.appendChild(i);
        li.appendChild(name);
        li.appendChild(val);
        legendEl.appendChild(li);
      });
    }

    function render() {
      var mix = computeMix(state.risk, state.age);
      donut(donutEl, mix, 220, 42);
      renderLegend(mix);
      var label = state.risk.charAt(0).toUpperCase() + state.risk.slice(1);
      liveEl.textContent = "A " + label.toLowerCase() + " mix at age " +
        state.age + ": " + words(mix) + ".";
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        state.risk = b.getAttribute("data-risk");
        buttons.forEach(function (x) {
          var on = x === b;
          x.classList.toggle("is-on", on);
          x.setAttribute("aria-checked", on ? "true" : "false");
        });
        render();
      });
    });

    ageInput.addEventListener("input", function () {
      state.age = parseInt(ageInput.value, 10);
      ageOut.textContent = state.age;
      render();
    });

    render();
  }

  // slim reading progress bar
  function buildProgress() {
    var bar = document.getElementById("progress");
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function init() {
    buildPieLegend();
    buildExamplePies();
    buildRebalance();
    buildTool();
    buildProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();