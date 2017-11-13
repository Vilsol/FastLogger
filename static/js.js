$(document).ready(function () {

    var xField = 'time';
    var yField = 'speed';

    var selectorOptions = {
        buttons: [{
            step: 'day',
            stepmode: 'backward',
            count: 1,
            label: '1d'
        }, {
            step: 'day',
            stepmode: 'backward',
            count: 7,
            label: '1w'
        }, {
            step: 'month',
            stepmode: 'backward',
            count: 1,
            label: '1m'
        }, {
            step: 'month',
            stepmode: 'backward',
            count: 6,
            label: '6m'
        }, {
            step: 'year',
            stepmode: 'todate',
            count: 1,
            label: 'YTD'
        }, {
            step: 'year',
            stepmode: 'backward',
            count: 1,
            label: '1y'
        }, {
            step: 'all',
        }],
    };

    $.ajax({url: "/data"})
        .done(function(data) {
            $("#loader").hide();
            $(".page-content").show();

            var oneHourSum = 0, oneDaySum = 0, oneWeekSum = 0, oneMonthSum = 0;
            var oneHourCount = 0, oneDayCount = 0, oneWeekCount = 0, oneMonthCount = 0;
            var currentTime = Date.now() / 1000;

            for(var i = data.length - 1; i >= 0; i--){
                var e = data[i];
                var diff = currentTime - e.time;

                if(diff < 3600){
                    oneHourSum += e.speed;
                    oneHourCount++;
                }

                if(diff < 86400){
                    oneDaySum += e.speed;
                    oneDayCount++;
                }

                if(diff < 604800){
                    oneWeekSum += e.speed;
                    oneWeekCount++;
                }

                if(diff < 18144000){
                    oneMonthSum += e.speed;
                    oneMonthCount++;
                }else{
                    break; // No point going further
                }
            }

            var oneHourAvg = oneHourSum / oneHourCount;
            var oneDayAvg = oneDaySum / oneDayCount;
            var oneWeekAvg = oneWeekSum / oneWeekCount;
            var oneMonthAvg = oneMonthSum / oneMonthCount;

            $("#average-1-hour").html(oneHourAvg.toFixed(2));
            $("#average-24-hours").html(oneDayAvg.toFixed(2));
            $("#average-7-days").html(oneWeekAvg.toFixed(2));
            $("#average-1-month").html(oneMonthAvg.toFixed(2));

            var xRaw = [], x6Avg = [], x72Avg = [];
            var yRaw = [], y6Avg = [], y72Avg = [];

            data.forEach(function(datum, i) {
                xRaw.push(new Date(datum[xField] * 1000));
                yRaw.push(datum[yField]);
            });

            for(var i = 0; i < xRaw.length; i++){
                var slice6 = yRaw.slice(Math.max(0, i - 5), Math.min(i + 1, xRaw.length - 1));
                var sum = slice6.reduce(function(a, b) { return a + b; });
                x6Avg.push(xRaw[i]);
                y6Avg.push(sum / slice6.length);

                var slice72 = yRaw.slice(Math.max(0, i - 71), Math.min(i + 1, xRaw.length - 1));
                sum = slice72.reduce(function(a, b) { return a + b; });
                x72Avg.push(xRaw[i]);
                y72Avg.push(sum / slice72.length);
            }

            var prepared = [{
                name: 'Mbps',
                mode: 'lines',
                x: xRaw,
                y: yRaw
            },{
                name: '6 Avg Mbps',
                mode: 'lines',
                x: x6Avg,
                y: y6Avg
            },{
                name: '72 Avg Mbps',
                mode: 'lines',
                x: x72Avg,
                y: y72Avg
            }];

            var layout = {
                xaxis: {
                    rangeselector: selectorOptions,
                    rangeslider: {}
                },
                yaxis: {
                    title: 'Mbps'
                }
            };

            Plotly.plot('graph', prepared, layout);
        });
});