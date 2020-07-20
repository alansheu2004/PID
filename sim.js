google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(createSims);

function Sim(figureId, graph, getAcc, adjustVel) {
    this.figureId = figureId;
    this.figure = document.getElementById(figureId);
    this.graph = graph;

    this.time = 0;
    this.counter = 0;
    this.interval = 50;

    this.ppm; //pixels per meter
    this.mpp; //meters per pixel

    this.posPx = 0;
    this.pv = 0;
    this.acc = 0;
    this.vel = 0;
    this.error = 0;

    this.car = document.querySelector("#" + figureId + " .car");
    this.setPointLine = document.querySelector("#" + figureId + " .setpointLine");
    this.errorBracket = document.querySelector("#" + figureId + " .errorBracket");
    this.timeSpan = document.querySelector("#" + figureId + " .time");
    this.pvSpan = document.querySelector("#" + figureId + " .pv");
    this.errorSpan = document.querySelector("#" + figureId + " .error");
    this.accSpan = document.querySelector("#" + figureId + " .acc");
    this.velSpan = document.querySelector("#" + figureId + " .vel");

    this.playButton = document.querySelector("#" + figureId + " .play");
    this.pauseButton = document.querySelector("#" + figureId + " .pause");
    this.resetButton = document.querySelector("#" + figureId + " .reset");

    var thisSim = this;

    this.getError = function() {
        return (this.setPointLine.offsetLeft - (this.posPx + this.car.offsetWidth)) * this.mpp;
    }

    this.update = function() {
        this.time += this.interval/1000;
        this.counter++;
        this.error = this.getError();
        
        this.acc = getAcc(this.error, this);

        this.vel += this.acc * this.interval/1000;
        adjustVel(this.error, this);

        this.pv += this.vel * this.interval/1000;
        this.posPx = this.pv * this.ppm;

        this.draw()
    }

    this.draw = function() {
        this.timeSpan.textContent = this.time.toFixed(2);
        this.pvSpan.textContent = this.pv.toFixed(2);
        this.errorSpan.textContent = this.error.toFixed(2);
        this.accSpan.textContent = Number(this.acc).toFixed(2);
        this.velSpan.textContent = this.vel.toFixed(2);

        this.car.style.marginLeft = this.posPx + "px";

        if(this.graph) {
            this.data.addRow([this.time, 10, this.pv, this.error]);
            if(this.counter % 20 == 0) {
                this.graph.draw(this.data, options);
            }

        }

        this.errorBracket.style.marginLeft = Math.min(this.setPointLine.offsetLeft, this.posPx + this.car.offsetWidth) + "px";
        this.errorBracket.style.width = Math.abs((this.setPointLine.offsetLeft - (this.posPx + this.car.offsetWidth))) + "px";
    }

    this.play = function() {
        this.loop = setInterval(function() {thisSim.update()}, this.interval);

        this.playButton.classList.remove("visible");
        this.pauseButton.classList.add("visible");
        this.resetButton.classList.remove("visible");
    }

    this.pause = function() {
        clearInterval(this.loop);

        this.playButton.classList.add("visible");
        this.pauseButton.classList.remove("visible");
        this.resetButton.classList.add("visible");
    }

    this.reset = function() {
        this.ppm = (this.setPointLine.offsetLeft - (this.car.offsetLeft + this.car.offsetWidth)) / 10;
        this.mpp = 1/this.ppm;
        this.vel = 0;
        this.posPx = 0;
        this.pv = 0;
        this.time = 0;
        this.counter = 0;
        this.acc = 0;
        this.error = 10 - this.pv;

        if(graph) {
            this.data = new google.visualization.DataTable();
            this.data.addColumn('number', 'time');
            this.data.addColumn('number', 'SP');
            this.data.addColumn('number', 'PV');
            this.data.addColumn('number', 'e');
            this.data.addRow([this.time, 10, this.pv, 10-this.pv]);

            this.graph = new google.visualization.LineChart(document.querySelector("#" + figureId + " .graph"));
        }

        this.playButton.classList.add("visible");
        this.pauseButton.classList.remove("visible");
        this.resetButton.classList.remove("visible");

        this.draw();
    }

    this.playButton.addEventListener("click", function() {thisSim.play();});
    this.pauseButton.addEventListener("click", function() {thisSim.pause();});
    this.resetButton.addEventListener("click", function() {thisSim.reset();});
    this.reset();
}

function getAccBB(error, sim) {
    if(error > 0) {
        return document.querySelector("#" + sim.figureId + " .accInput").value;
    } else if(error < 0) {
        return -document.querySelector("#" + sim.figureId + " .accInput").value;
    } else {
        return 0;
    }
}

function limitVel(error, sim) {
    if(sim.vel > document.querySelector("#" + sim.figureId + " .maxSpeedInput").value) {
        sim.vel = Number(document.querySelector("#" + sim.figureId + " .maxSpeedInput").value);
    } else if(sim.vel < -document.querySelector("#" + sim.figureId + " .maxSpeedInput").value) {
        sim.vel = -Number(document.querySelector("#" + sim.figureId + " .maxSpeedInput").value);
    }
}

function createSims() {
    BBCarSim1.sim = new Sim("BBCarSim1", false, getAccBB, limitVel);
    BBCarSim2.sim = new Sim("BBCarSim2", true, getAccBB, limitVel);
}

const options = {
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