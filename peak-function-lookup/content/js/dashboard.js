/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 90.9090909090909, "KoPercent": 9.090909090909092};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7520833333333333, 1000, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.99, 1000, 3000, "http://47.100.187.197:8080/Login/LogOn"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/Risk/Search"], "isController": false}, {"data": [0.5275, 1000, 3000, "http://47.100.187.197:8080/ProjectFunction/Search?id=2832"], "isController": false}, {"data": [0.995, 1000, 3000, "http://47.100.187.197:8080/ProjectFunction/Add"], "isController": false}, {"data": [0.0, 1000, 3000, "Test"], "isController": true}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2832"], "isController": false}, {"data": [0.0, 1000, 3000, "http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2832&userId=1"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectInfo/Search"], "isController": false}, {"data": [0.99, 1000, 3000, "http://47.100.187.197:8080/Device/Search"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1100, 100, 9.090909090909092, 404.2372727272726, 8, 98174, 1172.6999999999998, 1289.0, 3281.1500000000015, 2.4706775496269278, 39.867115274795495, 1.2399449740803465], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://47.100.187.197:8080/Login/LogOn", 100, 0, 0.0, 374.27000000000004, 23, 34407, 32.0, 54.59999999999991, 34064.47999999982, 0.225946319673372, 0.10613298804969915, 0.10833949507775942], "isController": false}, {"data": ["http://47.100.187.197:8080/Risk/Search", 100, 0, 0.0, 23.580000000000002, 18, 178, 28.0, 30.94999999999999, 176.6199999999993, 0.24516533950496217, 0.07852952281018319, 0.15107356369885852], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectFunction/Search?id=2832", 200, 0, 0.0, 1865.7799999999995, 56, 98174, 2068.1000000000004, 2520.599999999999, 8260.900000000009, 0.4869461900112728, 41.68884712902613, 0.22064749234885797], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectFunction/Add", 200, 0, 0.0, 46.91000000000001, 15, 3787, 32.0, 40.94999999999999, 169.7900000000002, 0.5045943313872812, 0.13649670878347353, 0.21410765330837273], "isController": false}, {"data": ["Test", 100, 100, 100.0, 4446.6100000000015, 2133, 98434, 5097.300000000004, 6609.999999999998, 97965.39999999976, 0.22458081989965728, 39.862459512289064, 1.2398001707937136], "isController": true}, {"data": ["http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2832", 100, 0, 0.0, 19.230000000000015, 10, 142, 21.900000000000006, 33.449999999999875, 141.98, 0.24500676218663636, 0.12441749642290127, 0.11269354002920481], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2832&userId=1", 100, 100, 100.0, 68.38000000000002, 8, 5408, 16.0, 25.94999999999999, 5355.329999999973, 0.24892712409514992, 0.09966808679590963, 0.12203263310133326], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectInfo/Search", 200, 0, 0.0, 28.410000000000007, 13, 453, 56.900000000000006, 108.84999999999997, 146.8900000000001, 0.48994990262245686, 0.8033455922881886, 0.28899388787496477], "isController": false}, {"data": ["http://47.100.187.197:8080/Device/Search", 100, 0, 0.0, 78.95000000000005, 13, 6013, 25.0, 29.0, 5953.43999999997, 0.24526154691362867, 0.18466469987344503, 0.1324508158625358], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 100, 100.0, 9.090909090909092], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1100, 100, "400", 100, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2832&userId=1", 100, 100, "400", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
