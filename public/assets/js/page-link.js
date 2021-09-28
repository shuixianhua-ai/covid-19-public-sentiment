var btn = document.getElementById("mybtn");
btn.onclick = function () {
    var str = document.getElementById("mytext").value;
    console.log(str);
    if (str == "数据总览" || str == "dashboard" || str == "Dashboard")
        location.href = "index.html";
    else if (str == "主地图" || str == "3D")
        location.href = "mainmap.html";
    else if (str == "查询" || str == "多边形查询" || str == "属性查询")
        location.href = "query-map.html";
    else if (str == "信息查询" || str == "详细查询")
        location.href = "detail-query.html";
    else if (str == "热力图" || str == "热力")
        location.href = "heat-map.html";
    else if (str == "迁移图" || str == "迁移")
        location.href = "migrate-map.html";
    else if (str == "舆情" || str == "文字" || str == "最新舆情")
        location.href = "blog-list-card-columns.html";
    else if (str == "情感" || str == "情感判断")
        location.href = "blog-list.html";
}