var a = document.getElementById("mainmap");

require([
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/WebMap",    // 二维地图
    "esri/WebScene"   // 三维场景
], function (MapView, SceneView, WebMap, WebScene) {

    var webmap = new WebMap({
        portalItem: {
            // autocasts as new PortalItem()
            id: "b855edeec7794abc99ffbfe556b2d0f9"
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
})