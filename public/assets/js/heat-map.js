var a = document.getElementById("heatMap");

require([
    "esri/views/MapView",
    "esri/widgets/LayerList",
    "esri/WebMap"
], function (MapView, LayerList, WebMap) {
    var webmap = new WebMap({
        portalItem: {
            // autocasts as new PortalItem()
            id: "0ed2a09eb3eb434f83318331b5c1377e"
        }
    });

    const view = new MapView({
        container: a,
        map: webmap,
        popup: {
            // 点击弹窗属性设置
            dockEnabled: true, // 弹窗锁定在面板下方
            dockOptions: {
                breakpoint: false
            }
        },
        center: [106, 34],
        zoom: 4
    });

    view.when(function () {
        var layerList = new LayerList({
            view: view
        });

        // Add widget to the top right corner of the view
        view.ui.add(layerList, "top-right");
    });
});