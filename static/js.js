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
            step: 'all'
        }]
    };

    $.ajax({url: "/data"})
        .done(function(data) {
            $("#loader").hide();
            $(".page-content").show();

            var oneHourMin = Number.MAX_SAFE_INTEGER, oneDayMin = Number.MAX_SAFE_INTEGER, oneWeekMin = Number.MAX_SAFE_INTEGER, oneMonthMin = Number.MAX_SAFE_INTEGER;
            var oneHourMax = 0, oneDayMax = 0, oneWeekMax = 0, oneMonthMax = 0;

            var oneHourSum = 0, oneDaySum = 0, oneWeekSum = 0, oneMonthSum = 0;
            var oneHourCount = 0, oneDayCount = 0, oneWeekCount = 0, oneMonthCount = 0;

            var currentTime = Date.now() / 1000;

            for(var i = data.length - 1; i >= 0; i--){
                var e = data[i];
                var diff = currentTime - e.time;

                if(diff < 3600){
                    oneHourSum += e.speed;
                    oneHourCount++;

                    if(e.speed < oneHourMin){
                        oneHourMin = e.speed;
                    }
                    
                    if(e.speed > oneHourMax){
                        oneHourMax = e.speed;
                    }
                }

                if(diff < 86400){
                    oneDaySum += e.speed;
                    oneDayCount++;

                    if(e.speed < oneDayMin){
                        oneDayMin = e.speed;
                    }

                    if(e.speed > oneDayMax){
                        oneDayMax = e.speed;
                    }
                }

                if(diff < 604800){
                    oneWeekSum += e.speed;
                    oneWeekCount++;

                    if(e.speed < oneWeekMin){
                        oneWeekMin = e.speed;
                    }

                    if(e.speed > oneWeekMax){
                        oneWeekMax = e.speed;
                    }
                }

                if(diff < 2592000){
                    oneMonthSum += e.speed;
                    oneMonthCount++;

                    if(e.speed < oneMonthMin){
                        oneMonthMin = e.speed;
                    }

                    if(e.speed > oneMonthMax){
                        oneMonthMax = e.speed;
                    }
                }else{
                    break; // No point going further
                }
            }

            var oneHourAvg = oneHourSum / oneHourCount;
            var oneDayAvg = oneDaySum / oneDayCount;
            var oneWeekAvg = oneWeekSum / oneWeekCount;
            var oneMonthAvg = oneMonthSum / oneMonthCount;

            $("#min-1-hour").html(oneHourMin.toFixed(2));
            $("#min-24-hours").html(oneDayMin.toFixed(2));
            $("#min-7-days").html(oneWeekMin.toFixed(2));
            $("#min-1-month").html(oneMonthMin.toFixed(2));

            $("#max-1-hour").html(oneHourMax.toFixed(2));
            $("#max-24-hours").html(oneDayMax.toFixed(2));
            $("#max-7-days").html(oneWeekMax.toFixed(2));
            $("#max-1-month").html(oneMonthMax.toFixed(2));

            $("#avg-1-hour").html(oneHourAvg.toFixed(2));
            $("#avg-24-hours").html(oneDayAvg.toFixed(2));
            $("#avg-7-days").html(oneWeekAvg.toFixed(2));
            $("#avg-1-month").html(oneMonthAvg.toFixed(2));

            var xRaw = [], x6Avg = [], x72Avg = [], x144Avg = [];
            var yRaw = [], y6Avg = [], y72Avg = [], y144Avg = [];

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

                var slice144 = yRaw.slice(Math.max(0, i - 143), Math.min(i + 1, xRaw.length - 1));
                sum = slice144.reduce(function(a, b) { return a + b; });
                x144Avg.push(xRaw[i]);
                y144Avg.push(sum / slice144.length);
            }

            var prepared = [{
                name: 'Mbps',
                mode: 'lines',
                x: xRaw,
                y: yRaw
            },{
                name: '1h Avg Mbps',
                mode: 'lines',
                x: x6Avg,
                y: y6Avg
            },{
                name: '12h Avg Mbps',
                mode: 'lines',
                x: x72Avg,
                y: y72Avg
            },{
                name: '24h Avg Mbps',
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