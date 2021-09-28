var a = document.getElementById("queryMap");

require([
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/WebMap",    // 二维地图
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch/SketchViewModel",//空间查询
  "esri/geometry/geometryEngine",
  "esri/Graphic",
  "esri/core/promiseUtils",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query"
], function (
  MapView,
  FeatureLayer,
  WebMap,
  GraphicsLayer,
  SketchViewModel,
  geometryEngine,
  Graphic,
  promiseUtils,
  QueryTask,
  Query
) {
  var webmap = new WebMap({
    portalItem: {
      // autocasts as new PortalItem()
      id: "e58885f80ecd4995b1503793d1c443f2"
    }
  });

  const h_view = new MapView({
    container: a,
    map: webmap,
    center: [106, 34],
    zoom: 4
  });

  /*const h_view = new MapView({
      container: a,
      map: webmap
  });*/

  const h_layer = new FeatureLayer({
    url: "https://services8.arcgis.com/9pDOy4IEA1P7klPU/arcgis/rest/services/%E5%9C%B0%E5%B8%82%E7%82%B9%E7%83%AD%E5%BA%A6/FeatureServer/0",
    outFields: ["*"]
  });
  const sketchLayer = new GraphicsLayer();
  h_view.map.addMany([sketchLayer]);


  document.getElementById("attDiv").style.display = "block";
  h_view.ui.add([resultDiv], "bottom-right");

  document.getElementById("infoDiv").style.display = "block";
  h_view.ui.add([resultDiv], "top-right");

  var resultsLayer = new GraphicsLayer();
  var popupTemplate = {
    title: "{CityNameC}",
    fieldInfos: [
      {
        fieldName: "CityNameC",
        //label: "Elevation (feet)",
      }
    ],
    content: "<br><b>舆情热度:</b> {heat} "
  };
  var qTask = new QueryTask({
    url: "https://services8.arcgis.com/9pDOy4IEA1P7klPU/arcgis/rest/services/%E5%9C%B0%E5%B8%82%E7%82%B9%E7%83%AD%E5%BA%A6/FeatureServer/0"
  });
  var params = new Query({
    returnGeometry: true,
    outFields: ["*"]
  })
  h_view.map.addMany([resultsLayer]);
  h_view.when(function () {
    document.getElementById("findBtn").addEventListener("click", doQuery);
    document.getElementById("clearBtn").addEventListener("click", clearQuery);
  });
  var value = document.getElementById("inputTxt");
  function doQuery() {
    resultsLayer.removeAll();
    params.where = "CityNameC LIKE '" + value.value + "%'";
    qTask
      .execute(params)
      .then(getResults)
      .catch(promiseRejected);
  }
  function clearQuery() {
    resultsLayer.removeAll();
    h_view.popup.close();
  }
  function getResults(response) {
    var peakResults = response.features.map(function (feature) {
      feature.popupTemplate = popupTemplate;
      return feature;
    });
    resultsLayer.addMany(peakResults);
    h_view
      .goTo(peakResults)
      .then(function () {
        h_view.popup.open({
          features: peakResults,
          updateLocationEnabled: true
        });
      })
      .catch(function (error) {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
  }
  function promiseRejected(error) {
    console.error("Promise rejected: ", error.message);
  }

  let sketchGeometry = null;
  const sketchViewModel = new SketchViewModel({
    layer: sketchLayer,
    defaultUpdateOptions: {
      tool: "reshape",
      toggleToolOnClick: false
    },
    view: h_view,

    polygonSymbol: {
      type: "polygon-2d",
      symbolLayers: [
        {
          type: "fill",
          material: {
            color: [255, 255, 255, 0.8]
          },
          outline: {
            color: [211, 132, 80, 0.7],
            size: "50px"
          }
        }
      ]
    },
    defaultCreateOptions: { hasZ: false }
  });
  sketchViewModel.on(["create"], function (evt) {
    if (evt.state === "complete") {
      sketchGeometry = evt.graphic.geometry;
      runQuery();
    }
  });
  sketchViewModel.on(["update"], function (evt) {
    if (evt.state === "complete") {
      sketchGeometry = evt.graphics[0].geometry;
      runQuery();
    }
  });

  document
    .getElementById("polygon-geometry-button")
    .addEventListener("click", geometryButtonsClickHandler);

  function geometryButtonsClickHandler(evt) {
    const geometryType = evt.target.value;
    clear();
    sketchViewModel.create(geometryType);
  }

  document
    .getElementById("clearFilter")
    .addEventListener("click", clear);
  function clear() {
    sketchGeometry = null;
    sketchViewModel.cancel();
    sketchLayer.removeAll();
    clearHighlighting();
    clearCharts();
    resultDiv.style.display = "none";
  }

  var debouncedRunQuery = promiseUtils.debounce(function () {
    if (!sketchGeometry) {
      return;
    }
    resultDiv.style.display = "block";
    return promiseUtils.eachAlways([
      queryStatistics(),
      updateFeatureLayer()
    ]);
  });

  function runQuery() {
    debouncedRunQuery().catch((error) => {
      if (error.name === "AbortError") {
        return;
      }
      console.error(error);
    });
  }

  var highlightHandle = null;
  function clearHighlighting() {
    if (highlightHandle) {
      highlightHandle.remove();
      highlightHandle = null;
    }
  }

  function highlightBuildings(objectIds) {
    clearHighlighting();
    document.getElementById("count").innerHTML = objectIds.length;
    highlightHandle = h_view.highlight(objectIds);
  }

  function updateFeatureLayer() {
    const query = h_layer.createQuery();
    query.geometry = sketchGeometry;
    query.distance = 5000;
    return h_layer
      .queryObjectIds(query)
      .then(highlightBuildings);
  }

  var heatChart = null;
  function queryStatistics() {
    const statDefinitions = [
      {
        onStatisticField: "heat",
        outStatisticFieldName: "heat_sum",
        statisticType: "sum"
      }
    ];
    const query = h_layer.createQuery();
    query.geometry = sketchGeometry;
    query.distance = 5000;
    query.outStatistics = statDefinitions;

    return h_layer.queryFeatures(query).then(function (result) {
      const allStats = result.features[0].attributes;
      updateChart(heatChart, [
        allStats.heat_sum
      ]);
    }, console.error);
  }
  function updateChart(chart, dataValues) {
    chart.data.datasets[0].data = dataValues;
    chart.update();
  }

  function createHeatChart() {
    const hCanvas = document.getElementById("heat-chart");
    heatChart = new Chart(hCanvas.getContext("2d"), {
      type: "horizontalBar",
      data: {
        labels: [
          "heat_sum"
        ],
        datasets: [
          {
            label: "heat sum",
            backgroundColor: "#149dcf",
            stack: "Stack 0",
            data: [0]
          }
        ]
      },
      options: {
        responsive: false,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "舆情总数"
        },
        scales: {
          xAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                precision: 0
              }
            }
          ],
          yAxes: [
            {
              stacked: true
            }
          ]
        }
      }
    });
  }
  function clearCharts() {
    updateChart(heatChart, [0]);
    document.getElementById("count").innerHTML = 0;
  }
  createHeatChart();
})