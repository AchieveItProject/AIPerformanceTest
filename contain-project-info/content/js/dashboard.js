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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7766666666666666, 1000, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.875, 1000, 3000, "http://47.100.187.197:8080/Login/LogOn"], "isController": false}, {"data": [0.9, 1000, 3000, "http://47.100.187.197:8080/Risk/Search"], "isController": false}, {"data": [0.975, 1000, 3000, "http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2834"], "isController": false}, {"data": [0.5, 1000, 3000, "http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1"], "isController": false}, {"data": [0.0, 1000, 3000, "Test"], "isController": true}, {"data": [0.85, 1000, 3000, "http://47.100.187.197:8080/ProjectInfo/Search"], "isController": false}, {"data": [0.9, 1000, 3000, "http://47.100.187.197:8080/Device/Search"], "isController": false}, {"data": [0.775, 1000, 3000, "http://47.100.187.197:8080/ProjectFunction/Search?id=2834"], "isController": false}, {"data": [0.95, 1000, 3000, "http://47.100.187.197:8080/ProjectInfo/Edit"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 140, 10, 7.142857142857143, 401.91428571428577, 8, 8475, 1229.6000000000004, 2192.849999999999, 7143.320000000011, 2.483282189545382, 7.231242904908029, 1.241294654735087], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["http://47.100.187.197:8080/Login/LogOn", 20, 0, 0.0, 498.2, 12, 5227, 1717.400000000001, 5054.199999999997, 5227.0, 0.36154597057015797, 0.14299425593839257, 0.17424114890270798], "isController": false}, {"data": ["http://47.100.187.197:8080/Risk/Search", 10, 0, 0.0, 347.19999999999993, 15, 1697, 1683.1000000000001, 1697.0, 1697.0, 0.24988755060222897, 0.08004210605227648, 0.1539834418261782], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectUserInfo/Search?projectId=2834", 20, 0, 0.0, 141.10000000000005, 9, 2114, 389.20000000000084, 2029.7499999999989, 2114.0, 0.498603909054647, 0.1828376639160351, 0.2030447559333865], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1", 20, 10, 50.0, 18.95, 8, 42, 34.800000000000004, 41.64999999999999, 42.0, 0.5413745499824053, 0.16944388991148526, 0.2315645047776304], "isController": false}, {"data": ["Test", 10, 10, 100.0, 5626.8, 1108, 33223, 30997.10000000001, 33223.0, 33223.0, 0.1771604719554973, 7.222403381107608, 1.239777287141693], "isController": true}, {"data": ["http://47.100.187.197:8080/ProjectInfo/Search", 20, 0, 0.0, 576.9499999999999, 16, 4734, 3464.300000000005, 4683.199999999999, 4734.0, 0.4128393023015791, 0.6787255521725668, 0.24351068221694705], "isController": false}, {"data": ["http://47.100.187.197:8080/Device/Search", 10, 0, 0.0, 349.9, 14, 2197, 2082.0000000000005, 2197.0, 2197.0, 0.26084461486292615, 0.19639765435480083, 0.1408662812687482], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectFunction/Search?id=2834", 20, 0, 0.0, 1044.0499999999997, 8, 8475, 3030.7000000000035, 8210.349999999995, 8475.0, 0.5110514884374601, 8.61501054043695, 0.2046202248626549], "isController": false}, {"data": ["http://47.100.187.197:8080/ProjectInfo/Edit", 20, 0, 0.0, 185.60000000000002, 15, 3181, 46.40000000000001, 3024.299999999998, 3181.0, 0.7593302707012415, 0.2054047704924257, 0.46605378431223665], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 10, 100.0, 7.142857142857143], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 140, 10, "400", 10, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["http://47.100.187.197:8080/WorkHourInfo/MyWorkHours?projectId=2834&userId=1", 20, 10, "400", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
