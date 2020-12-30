function Sim(figureId, getAcc, adjustAcc, adjustVel, adjustPV) {
    sims.push(this);

    this.figureId = figureId;
    this.figure = document.getElementById(figureId);
    this.adjustAcc = adjustAcc;
    this.adjustVel = adjustVel;
    this.adjustPV = adjustPV;
    this.noise = noise;

    this.interval = 0.05;

    this.errorBar = document.querySelector("#" + figureId + " .errorBar");
    this.accBar = document.querySelector("#" + figureId + " .accBar");
    this.accPBar = document.querySelector("#" + figureId + " .accPBar") || null;
    this.accIBar = document.querySelector("#" + figureId + " .accIBar") || null;
    this.accDBar = document.querySelector("#" + figureId + " .accDBar") || null;

    this.car = document.querySelector("#" + figureId + " .car");
    this.spSlider = document.querySelector("#" + figureId + " .spSlider");

    this.graph = document.querySelector("#" + figureId + " .graph") || null;
    if(this.graph) {
        this.ctx = this.graph.getContext("2d");
        this.graphDuration = 15;
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
        for(let adjustAcc of this.adjustAcc) {
            adjustAcc(this);
        }
        this.vel += this.acc * this.interval;
        for(let adjustVel of this.adjustVel) {
            adjustVel(this);
        }
        this.pv += this.vel * this.interval;
        for(let adjustPV of this.adjustPV) {
            adjustPV(this);
        }

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

        if(this.accPBar) {
            this.accPBar.style.left = (this.pv + Math.min(0,this.accP))*100 + "%";
            this.accPBar.style.width = Math.abs(this.accP)*100 + "%";
        }

        if(this.accIBar) {
            this.accIBar.style.left = (this.pv + Math.min(0,this.accI))*100 + "%";
            this.accIBar.style.width = Math.abs(this.accI)*100 + "%";
        }

        if(this.accDBar) {
            this.accDBar.style.left = (this.pv + Math.min(0,this.accD))*100 + "%";
            this.accDBar.style.width = Math.abs(this.accD)*100 + "%";
        }

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
        this.pv = 0.1;

        this.sps = [];
        this.pvs = [];

        this.time = 0;
        this.vel = 0;
        this.error = this.sp - this.pv;
        this.lastError = null;
        this.acc = getAcc(this);


        this.integral = 0;
        this.derivative = 0;

        this.update();
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
    sim.accP = document.querySelector("#" + sim.figureId + " .pInput").value * sim.error;
    return sim.accP;
}

function getAccPI(sim) {
    sim.accI = document.querySelector("#" + sim.figureId + " .iInput").value * sim.integral;
    return getAccP(sim) + sim.accI;
}

function getAccPID(sim) {
    sim.accD = document.querySelector("#" + sim.figureId + " .dInput").value * sim.derivative;
    return getAccPI(sim) + sim.accD;
}

function minAcc(sim) {
    if(Math.abs(sim.vel) < 0.05 && Math.abs(sim.acc) < document.querySelector("#" + sim.figureId + " .minAccInput").value) {
        sim.acc = 0;
    }
}

function damp(sim) {
    sim.vel *= 1.0-document.querySelector("#" + sim.figureId + " .dampInput").value;
}

function noise(sim) {
    sim.pv += (Math.random()-0.5)*document.querySelector("#" + sim.figureId + " .noiseInput").value;
}

function createSims() {
    BBSim1.sim = new Sim("BBSim1", getAccBB, [], [], []);
    BBSim2.sim = new Sim("BBSim2", getAccBB, [], [], []);
    PSim3.sim = new Sim("PSim3", getAccP, [], [], []);
    PSim4.sim = new Sim("PSim4", getAccP, [minAcc], [damp], []);
    PISim5.sim = new Sim("PISim5", getAccPI, [minAcc], [damp], []);
    PIDSim6.sim = new Sim("PIDSim6", getAccPID, [minAcc], [damp], []);
    PIDSim7.sim = new Sim("PIDSim7", getAccPID, [minAcc], [damp], [noise]);
    PIDSim8.sim = new Sim("PIDSim8", getAccPID, [minAcc], [damp], [noise]);
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