function Sim(figureId, getAcc) {
    sims.push(this);

    this.figureId = figureId;
    this.figure = document.getElementById(figureId);

    this.interval = 0.05;

    this.errorBar = document.querySelector("#" + figureId + " .errorBar");
    this.accBar = document.querySelector("#" + figureId + " .accBar");
    this.car = document.querySelector("#" + figureId + " .car");
    this.spSlider = document.querySelector("#" + figureId + " .spSlider");

    this.graph = document.querySelector("#" + figureId + " .graph") || null;
    if(this.graph) {
        this.ctx = this.graph.getContext("2d");
        this.graphDuration = 5;
        this.graphTicks = this.graphDuration/this.interval;
    }

    this.playButton = document.querySelector("#" + figureId + " .play");
    this.pauseButton = document.querySelector("#" + figureId + " .pause");
    this.resetButton = document.querySelector("#" + figureId + " .reset");

    this.playButton.classList.add("visible");
    this.pauseButton.classList.remove("visible");
    this.resetButton.classList.add("visible");

    var thisSim = this;

    this.getError = function() {
        return this.sp - this.pv;
    }

    this.update = function() {
        this.time += this.interval;
        this.sp = this.spSlider.value;
        this.error = this.getError();

        if(this.lastError != null) {
            this.integral += this.interval * (this.error + this.lastError)/2;
            this.derivative = (this.error - this.lastError)/this.interval;
        }
        
        this.acc = getAcc(this);
        this.vel += this.acc * this.interval;
        this.pv += this.vel * this.interval;

        this.lastError = this.error;

        this.pvs.unshift(this.pv);
        this.sps.unshift(this.sp);

        this.draw();
    }

    this.draw = function() {
        this.car.style.left = (this.pv-0.5)*100 + "%";

        this.errorBar.style.left = (this.pv + Math.min(0,this.error))*100 + "%";
        this.errorBar.style.width = Math.abs(this.error)*100 + "%";

        this.accBar.style.left = (this.pv + Math.min(0,this.acc))*100 + "%";
        this.accBar.style.width = Math.abs(this.acc)*100 + "%";

        if(this.graph) {
            this.ctx.clearRect(0, 0, this.graph.width, this.graph.height);
            this.ctx.lineWidth = 5;

            this.ctx.strokeStyle = "blue";
            this.ctx.beginPath();
            this.ctx.moveTo(this.sp*this.graph.width, 0);
            for(var i=1; i<this.graphTicks; i++) {
                this.ctx.lineTo(this.sps[i]*this.graph.width, i*this.graph.height/this.graphTicks);
            }
            this.ctx.stroke();

            this.ctx.strokeStyle = "red";
            this.ctx.beginPath();
            this.ctx.moveTo(this.pv*this.graph.width, 0);
            for(var i=1; i<this.graphTicks; i++) {
                this.ctx.lineTo(this.pvs[i]*this.graph.width, i*this.graph.height/this.graphTicks);
            }
            this.ctx.stroke();
        }
        
    }

    this.play = function() {
        this.loop = setInterval(function() {thisSim.update()}, this.interval*1000);

        this.playButton.classList.remove("visible");
        this.pauseButton.classList.add("visible");

        runningSims.push(this);
    }

    this.pause = function() {
        clearInterval(this.loop);

        this.playButton.classList.add("visible");
        this.pauseButton.classList.remove("visible");

        let index = runningSims.indexOf(this);
        if (index > -1) { runningSims.splice(index, 1); }
    }

    this.reset = function() {
        this.spSlider.value = 0.5;
        this.sp = this.spSlider.value;
        this.pv = 0.25;

        this.sps = [];
        this.pvs = [];

        this.time = 0;
        this.vel = 0;
        this.error = this.sp - this.pv;
        this.lastError = null;
        this.acc = getAcc(this);

        this.integral = 0;
        this.derivative = 0;

        this.draw();
    }

    this.playButton.addEventListener("click", function() {thisSim.play();});
    this.pauseButton.addEventListener("click", function() {thisSim.pause();});
    this.resetButton.addEventListener("click", function() {thisSim.reset();});

    this.reset();
}

function getAccBB(sim) {
    if(sim.error > 0) {
        return document.querySelector("#" + sim.figureId + " .accInput").value;
    } else if(sim.error < 0) {
        return -document.querySelector("#" + sim.figureId + " .accInput").value;
    } else {
        return 0;
    }
}

function getAccP(sim) {
    return document.querySelector("#" + sim.figureId + " .pInput").value * sim.error;
}

function getAccPI(sim) {
    return getAccP(sim) + document.querySelector("#" + sim.figureId + " .iInput").value * sim.integral;
}

function createSims() {
    BBCarSim1.sim = new Sim("BBCarSim1", getAccBB);
    BBCarSim2.sim = new Sim("BBCarSim2", getAccBB);
}

var sims = [];
var runningSims = [];
window.addEventListener("scroll", function() {
    let simsToPause = [];
    for(let sim of runningSims) {
        let box = sim.figure.getBoundingClientRect();
        if(box.top > window.innerHeight || box.bottom < 0) {
            simsToPause.push(sim);
        }
    }
    for(let sim of simsToPause) {
        sim.pause();
    }
});

createSims();