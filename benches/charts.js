/**
 * Shared Highcharts renderer for benchmark pages.
 *
 * Progressive enhancement: bails silently if Highcharts is not loaded.
 * Reads <script type="application/json" id="chart-data-*"> elements
 * and renders into matching <div id="chart-*"> containers.
 */
(function () {
  "use strict";

  if (typeof Highcharts === "undefined") return;

  var COLORS = {
    axe: "#555555",
    al: "#0055cc",
    ibm: "#be95ff",
  };

  // Shared defaults
  Highcharts.setOptions({
    credits: { enabled: false },
    accessibility: { enabled: true },
    chart: {
      style: { fontFamily: "system-ui, -apple-system, sans-serif" },
    },
    colors: [COLORS.axe, COLORS.al, COLORS.ibm],
  });

  function readData(id) {
    var el = document.getElementById("chart-data-" + id);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (_) {
      return null;
    }
  }

  // --- Index page charts ---

  // Grouped bar: median audit time per tool
  function renderSpeedChart() {
    var data = readData("speed");
    var container = document.getElementById("chart-speed");
    if (!data || !container) return;

    Highcharts.chart(container, {
      chart: { type: "bar", height: 220 },
      title: { text: null },
      xAxis: {
        categories: data.categories,
        labels: { style: { fontSize: "14px" } },
      },
      yAxis: {
        title: { text: "Milliseconds" },
        min: 0,
      },
      tooltip: { valueSuffix: " ms" },
      legend: { enabled: false },
      series: [
        {
          name: "Median audit time",
          data: data.values.map(function (v, i) {
            return { y: v, color: data.colors[i] };
          }),
        },
      ],
      accessibility: {
        description: "Bar chart comparing median audit time across tools.",
      },
    });
  }

  // Stacked bar: concordance per WCAG criterion
  function renderConcordanceChart() {
    var data = readData("concordance");
    var container = document.getElementById("chart-concordance");
    if (!data || !container) return;

    Highcharts.chart(container, {
      chart: { type: "bar", height: 40 * data.categories.length + 120 },
      title: { text: null },
      xAxis: {
        categories: data.categories,
        labels: { style: { fontSize: "13px" } },
      },
      yAxis: {
        min: 0,
        title: { text: "Sites" },
        stackLabels: { enabled: false },
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
      },
      plotOptions: {
        bar: {
          stacking: "normal",
          dataLabels: { enabled: false },
        },
      },
      legend: { reversed: true },
      series: [
        { name: "All three", data: data.allThree, color: "#1a7f37" },
        { name: "Two of three", data: data.twoOfThree, color: "#0055cc" },
        { name: "One only", data: data.oneOnly, color: "#bf8700" },
      ],
      accessibility: {
        description:
          "Stacked bar chart showing agreement levels per WCAG criterion.",
      },
    });
  }

  // Heatmap: 3×3 pairwise kappa matrix
  function renderKappaChart() {
    var data = readData("kappa");
    var container = document.getElementById("chart-kappa");
    if (!data || !container) return;

    Highcharts.chart(container, {
      chart: { type: "heatmap", height: 300 },
      title: { text: null },
      xAxis: {
        categories: data.labels,
        opposite: true,
      },
      yAxis: {
        categories: data.labels,
        title: null,
        reversed: true,
      },
      colorAxis: {
        min: -0.2,
        max: 1,
        stops: [
          [0, "#fee2e2"],
          [0.3, "#fef9c3"],
          [0.6, "#bbf7d0"],
          [1, "#166534"],
        ],
      },
      tooltip: {
        formatter: function () {
          return (
            "<b>" +
            this.series.xAxis.categories[this.point.x] +
            " ↔ " +
            this.series.yAxis.categories[this.point.y] +
            "</b><br>κ = " +
            Highcharts.numberFormat(this.point.value, 2)
          );
        },
      },
      series: [
        {
          name: "Cohen's κ",
          data: data.data,
          dataLabels: {
            enabled: true,
            format: "{point.value:.2f}",
            style: { fontSize: "13px", fontWeight: "bold", textOutline: "none" },
          },
          borderWidth: 1,
          borderColor: "#ffffff",
        },
      ],
      legend: {
        align: "right",
        layout: "vertical",
        verticalAlign: "middle",
      },
      accessibility: {
        description: "Heatmap of pairwise Cohen's kappa agreement between tools.",
      },
    });
  }

  // --- Drilldown page charts ---

  // Donut: agreement breakdown
  function renderAgreementChart() {
    var data = readData("agreement");
    var container = document.getElementById("chart-agreement");
    if (!data || !container) return;

    Highcharts.chart(container, {
      chart: { type: "pie", height: 300 },
      title: { text: null },
      plotOptions: {
        pie: {
          innerSize: "55%",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.y}",
            style: { fontSize: "13px" },
          },
        },
      },
      series: [
        {
          name: "Sites",
          data: [
            { name: "All three", y: data.allThree, color: "#1a7f37" },
            { name: "Two of three", y: data.twoOfThree, color: "#0055cc" },
            { name: "One only", y: data.oneOnly, color: "#bf8700" },
          ].filter(function (d) {
            return d.y > 0;
          }),
        },
      ],
      accessibility: {
        description: "Donut chart showing agreement breakdown for this criterion.",
      },
    });
  }

  // Horizontal bar: top rules per tool
  function renderRulesChart() {
    var data = readData("rules");
    var container = document.getElementById("chart-rules");
    if (!data || !container) return;

    var allCategories = [];
    var seen = {};
    var tools = ["axe", "al", "ibm"];
    var toolLabels = { axe: "axe-core", al: "@accesslint/core", ibm: "IBM EA" };

    tools.forEach(function (t) {
      (data[t] || []).forEach(function (r) {
        if (!seen[r.ruleId]) {
          seen[r.ruleId] = true;
          allCategories.push(r.ruleId);
        }
      });
    });

    if (allCategories.length === 0) return;

    var series = tools.map(function (t) {
      var ruleMap = {};
      (data[t] || []).forEach(function (r) {
        ruleMap[r.ruleId] = r.count;
      });
      return {
        name: toolLabels[t],
        color: COLORS[t],
        data: allCategories.map(function (cat) {
          return ruleMap[cat] || 0;
        }),
      };
    });

    Highcharts.chart(container, {
      chart: { type: "bar", height: 30 * allCategories.length + 120 },
      title: { text: null },
      xAxis: {
        categories: allCategories,
        labels: { style: { fontSize: "12px" } },
      },
      yAxis: {
        min: 0,
        title: { text: "Sites" },
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "{series.name}: {point.y}",
      },
      plotOptions: {
        bar: { groupPadding: 0.1 },
      },
      series: series,
      accessibility: {
        description: "Horizontal bar chart showing top rules per tool.",
      },
    });
  }

  // --- Init ---

  renderSpeedChart();
  renderConcordanceChart();
  renderKappaChart();
  renderAgreementChart();
  renderRulesChart();
})();
