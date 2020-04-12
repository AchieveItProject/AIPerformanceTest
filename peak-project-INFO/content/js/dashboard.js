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

    var data = {"OkPercent": 92.85714285714286, "KoPercent": 7.142857142857143};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8666666666666667, 1000, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/Login/LogOn"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/Risk/Search"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2834"], "isController": false}, {"data": [0.5, 1000, 3000, "http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1"], "isController": false}, {"data": [0.0, 1000, 3000, "Test"], "isController": true}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectInfo/Search"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/Device/Search"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectFunction/Search?id=2834"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectInfo/Edit"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14, 1, 7.142857142857143, 22.857142857142858, 11, 74, 60.5, 74.0, 74.0, 42.16867469879518, 22.875682417168672, 21.078454442771083], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://47.100.187.197:8080/Login/LogOn", 2, 0, 0.0, 46.5, 19, 74, 74.0, 74.0, 74.0, 20.833333333333332, 8.23974609375, 10.040283203125], "isController": false}, {"data": ["http://47.100.187.197:8080/Risk/Search", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 21.27659574468085, 6.815159574468085, 13.110871010638299], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2834", 2, 0, 0.0, 16.0, 15, 17, 17.0, 17.0, 17.0, 16.129032258064516, 5.914503528225806, 6.568170362903226], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1", 2, 1, 50.0, 12.5, 11, 14, 14.0, 14.0, 14.0, 35.08771929824561, 10.982044956140351, 15.008223684210526], "isController": false}, {"data": ["Test", 1, 1, 100.0, 320.0, 320, 320, 320.0, 320.0, 320.0, 3.125, 23.7335205078125, 21.868896484375], "isController": true}, {"data": ["http://47.100.187.197:8080/ProjectInfo/Search", 2, 0, 0.0, 21.0, 19, 23, 23.0, 23.0, 23.0, 46.51162790697674, 76.4671148255814, 27.434593023255815], "isController": false}, {"data": ["http://47.100.187.197:8080/Device/Search", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 55.55555555555555, 41.829427083333336, 30.002170138888893], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectFunction/Search?id=2834", 2, 0, 0.0, 13.0, 12, 14, 14.0, 14.0, 14.0, 27.027027027027028, 7.32421875, 10.821368243243244], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectInfo/Edit", 2, 0, 0.0, 18.5, 17, 20, 20.0, 20.0, 20.0, 54.054054054054056, 14.62204391891892, 33.17673141891892], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 1, 100.0, 7.142857142857143], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14, 1, "400", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1", 2, 1, "400", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
