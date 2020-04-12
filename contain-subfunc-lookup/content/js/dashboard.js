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

    var data = {"OkPercent": 95.23809523809524, "KoPercent": 4.761904761904762};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9052272727272728, 1000, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/Login/LogOn"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/Risk/Search"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectFunction/Add"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2834"], "isController": false}, {"data": [0.5, 1000, 3000, "http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1"], "isController": false}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectSubFunction/SubAdd"], "isController": false}, {"data": [0.0, 1000, 3000, "Test"], "isController": true}, {"data": [1.0, 1000, 3000, "http://47.100.187.197:8080/ProjectInfo/Search"], "isController": false}, {"data": [0.995, 1000, 3000, "http://47.100.187.197:8080/Device/Search"], "isController": false}, {"data": [0.98125, 1000, 3000, "http://47.100.187.197:8080/ProjectFunction/Search?id=2834"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2100, 100, 4.761904761904762, 57.091428571428594, 7, 3050, 122.0, 223.0, 857.7599999999948, 17.413512885999538, 49.423945057257285, 7.644324853228962], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://47.100.187.197:8080/Login/LogOn", 200, 0, 0.0, 25.549999999999997, 11, 150, 38.80000000000001, 66.69999999999993, 144.99, 1.6826660160358071, 0.5849893571374486, 0.5628057719651015], "isController": false}, {"data": ["http://47.100.187.197:8080/Risk/Search", 200, 0, 0.0, 21.155, 7, 144, 34.0, 43.849999999999966, 142.97000000000003, 1.683615058253081, 0.4595414148259142, 0.7957711798774328], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectFunction/Add", 200, 0, 0.0, 31.285000000000007, 16, 160, 44.0, 48.0, 151.94000000000005, 1.6770504037498848, 0.4536552361706231, 0.7124188726867186], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2834", 200, 0, 0.0, 21.58500000000002, 7, 144, 33.0, 47.849999999999966, 139.99, 1.6835583689686522, 0.6173595386208289, 0.6855896873632108], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1", 200, 100, 50.0, 16.889999999999997, 8, 142, 28.0, 37.799999999999955, 137.95000000000005, 1.676136839811602, 0.5246111886324399, 0.7169413435912908], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectSubFunction/SubAdd", 200, 0, 0.0, 26.38000000000001, 7, 147, 42.900000000000006, 80.19999999999982, 144.94000000000005, 1.671625823275718, 0.45218784477282603, 0.8284668997191669], "isController": false}, {"data": ["Test", 100, 100, 100.0, 1198.9200000000005, 367, 6796, 2393.9000000000015, 4466.349999999993, 6793.249999999998, 0.8288094152749576, 49.39977686896523, 7.640586797066015], "isController": true}, {"data": ["http://47.100.187.197:8080/ProjectInfo/Search", 300, 0, 0.0, 25.883333333333326, 8, 362, 39.0, 69.94999999999999, 138.99, 2.525295038637014, 2.9576860511119714, 1.2758000976447414], "isController": false}, {"data": ["http://47.100.187.197:8080/Device/Search", 200, 0, 0.0, 39.18499999999999, 8, 3050, 37.0, 122.89999999999998, 152.96000000000004, 1.675715530531537, 0.8198569148401367, 0.729852662711978], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectFunction/Search?id=2834", 400, 0, 0.0, 189.30250000000015, 8, 2774, 461.80000000000007, 856.7999999999997, 2104.3000000000034, 3.3236670018030896, 42.73279885478899, 1.41840085916792], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 100, 100.0, 4.761904761904762], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2100, 100, "400", 100, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1", 200, 100, "400", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
