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
], function (MapView, FeatureLayer, WebMap, GraphicsLayer,
   SketchViewModel, geometryEngine, Graphic, promiseUtils,QueryTask,Query) {

   // var infoTemplate = new InfoTemplate("${CITY_NAME}", "Name : ${CITY_NAME}<br/> State : ${STATE_NAME}<br />Population : ${POP1990}");
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

    var resultsLayer = new GraphicsLayer();
    var popupTemplate = {
      title: "{province},{date}",
      fieldInfos: [
        {
          fieldName: "province",
          //label: "Elevation (feet)",
        }
      ],
      content: "<br> {title} "
    };

  
    var peaksUrl =
          "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/publicdata/FeatureServer/0";

    var qTask = new QueryTask("https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/publicdata/FeatureServer/0");

    var params = new Query({
      returnGeometry: true,
      outFields: ["*"]
  })

    
    
    h_view.when(function() {
      
      document.getElementById("aFilter").addEventListener("click", doQuery);
      document.getElementById("clearBtn").addEventListener("click", clearQuery);
    });

    function doQuery() {
      resultsLayer.removeAll();
      var month = document.getElementById("query-month").value;
      var day=  document.getElementById("query-day").value;
      var pro = document.getElementById("query-p").value;
      if(month=="2"){
        if(day>29)
        {
          alert("请输入正确日期");
          return;
        }
        
      }
      else if(month=="4")
      {
        if(day>30)
        {
          alert("请输入正确日期");
          return;
        }
      }
      else{}

      if(pro.length==0)
      {
        alert("请输入省份");
          return;
      }

      var date="2020/"+month+"/"+day;
      
      params.where = "date = '"+date+"' AND "+"province like '"+pro+"%'";
      qTask
        .execute(params)
        .then(getResults)
        .catch(promiseRejected);
    }

    function clearQuery()
    {
        resultsLayer.removeAll();
    }


    function getResults(response) {
      var peakResults = response.features.map(function(feature) {
        feature.popupTemplate = popupTemplate;
        return feature;
      });
      resultsLayer.addMany(peakResults);
      h_view
        .goTo(peakResults)
        .then(function() {
          h_view.popup.open({
            features: peakResults,
            updateLocationEnabled: true
          });
        })
        .catch(function(error) {
          if (error.name != "AbortError") {
            console.error(error);
          }
      });
  }

    function promiseRejected(error) {
         console.error("Promise rejected: ", error.message);
         }
        

          
        
    
    
    
    
    

    /*const h_view = new MapView({
        container: a,
        map: webmap
    });*/

    
    
    

    
    document.getElementById("infoDiv").style.display = "block";
    

    
    
 

       

             
      

      
        
       
})