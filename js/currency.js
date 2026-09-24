// Currency: all amounts are stored in NZD; displayed in EUR (default) or NZD.
// Indicative fixed rate for this class project: 1 NZ$ = 0.50 EUR.
var FX_NZD_TO_EUR = 0.5;

var Currency = (function () {
  "use strict";

  var state = "eur";
  try {
    var saved = window.localStorage.getItem("vuw-currency");
    if (saved === "eur" || saved === "nzd") state = saved;
  } catch (e) { /* storage unavailable — stay on default */ }

  function money(nzdAmount) {
    var v = Number(nzdAmount);
    if (state === "eur") v = Math.round(v * FX_NZD_TO_EUR);
    var sym = state === "eur" ? "€" : "NZ$";
    return sym + v.toLocaleString("en-NZ");
  }

  // Update every element marked with data-nzd="35000"
  function applyStatic() {
    var nodes = document.querySelectorAll("[data-nzd]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = money(nodes[i].getAttribute("data-nzd"));
    }
  }

  function announce() {
    applyStatic();
    document.dispatchEvent(new CustomEvent("currencychange"));
  }

  function setState(s) {
    state = s;
    try { window.localStorage.setItem("vuw-currency", s); } catch (e) { /* ignore */ }
    syncButtons();
    announce();
  }

  function syncButtons() {
    var btns = document.querySelectorAll(".currency-switch button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-cur") === state ? "true" : "false");
    }
  }

  function init() {
    var wrap = document.querySelector(".currency-switch");
    if (wrap) {
      wrap.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-cur]");
        if (btn) setState(btn.getAttribute("data-cur"));
      });
    }
    syncButtons();
    applyStatic();
  }

  return {
    money: money,
    applyStatic: applyStatic,
    init: init,
    getState: function () { return state; }
  };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", Currency.init);
} else {
  Currency.init();
}
