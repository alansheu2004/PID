google.charts.load('current', {'packages':['corechart']});

google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'time');
    data.addColumn('number', 'SP');
    data.addColumn('number', 'PV');
    data.addColumn('number', 'e');
    data.addRows([
        [1, 10, 0, 10],
        [2, 10, 3, 7],
        [3, 10, 5, 5],
        [4, 10, 7, 3],
        [5, 10, 8.5, 1.5]
    ]);

    var options = {
        'width': '100%',
        'legend': 'right',
        'series': {
            0: {'color': 'blue', 'lineDashStyle': [10,8]}, 
            1: {'color': 'red'}, 
            2: {'color': 'green'}
        },
        'backgroundColor': {
            "fill": "transparent"
        },
        'legend': {
            'position': 'top',
            'textStyle': {
                'fontSize': 14,
                'fontName': 'Montserrat'
            }
        },
        'hAxis': {
            'title': 'Time (s)',
            'titleTextStyle': {
                'fontName': 'Montserrat',
                'fontSize': 18,
                'italic': false
            },
            'baselineColor': 'black',
            'minValue': 10,
            'gridlines': {
                'color': 'gray'
            },
            'minorGridlines': {
                'color': 'white'
            },
            'textStyle': {
                'fontName': 'Montserrat',
                'fontSize': 14
            }
        },
        'vAxis': {
            'title': 'Position (m)',
            'titleTextStyle': {
                'fontName': 'Montserrat',
                'fontSize': 18,
                'italic': false
            },
            'baselineColor': 'black',
            'gridlines': {
                'color': 'gray'
            },
            'minorGridlines': {
                'color': 'white'
            },
            'textStyle': {
                'fontName': 'Montserrat',
                'fontSize': 14
            }
        },
    };


    var chart = new google.visualization.LineChart(document.getElementById('graph2'));
    chart.draw(data, options);
}