import { me as device } from "device";

// Screen dimension fallback for older firmware
if (!device.screen) device.screen = { width: 348, height: 250 };

export default class Graph {
    
    constructor(id) {
        
        this._id = id;
        this._xscale = 0;
        this._yscale = 0;
        this._xmin = 1000;
        this._xmax = 0;
        this._bgymin = 1000;
        this._bgymax = 0;
        this._pymin = 1000;
        this._pymax = 0;
        this._ymin = 1000;
        this._ymax = 0;
        this._pointsize = 2;   
        this._direction = "forward"; // or "reverse"
        
        this._bg = this._id.getElementById("bg");
        
        this._vals = this._id.getElementsByClassName("gval");
        
        this._tUH = 200;
        this._tHigh = 162;
        this._tLow = 72;
        this._tUL = 60;

        this._UHC = "violet";
        this._HC = "blue";
        this._IRC = "lightgreen";
        this._LC = "pink";
        this._ULC = "red";
        this._PC = "yellow";
        
        this._tHighL = this._id.getElementById("tHigh");
        this._tLowL = this._id.getElementById("tLow");
        this._tUHL = this._id.getElementById("tUrgentHigh");
        this._tULL = this._id.getElementById("tUrgentLow");
        
        this._defaultYmin = 40;
        this._defaultYmax = 400;
        
//        this._bgValue = 0;
//        this._bgUnits = "bg/dL";
    }
    
    setPosition(x,y){   
        this._id.x = x;
        this._id.y = y;
    }
    
    setSize(w,h){
        this._width = w;
        this._height = h; 
    } 
    
    setXRange(xmin, xmax){

        this._xmin = xmin;
        this._xmax = xmax;
        this._xscale = (xmax-xmin)/this._width;
        //console.log("XSCALE: " + this._xscale);
        
    }
    
    setBGYRange(ymin, ymax){
        
        if (ymin < this._pymin) {
            this._bgymin = ymin;
            this._ymin = ymin;
        }
        if (ymax > this._pymax) {
            this._bgymax = ymax;
            this._ymax = ymax;
        }
        this._yscale = (this._ymax-this._ymin)/(this._id.height-1);
        //console.log("YSCALE: " + this._yscale);
        
    } 

    setPredYRange(ymin, ymax){
        
        //console.log(`PredYRange with ${ymin}:${ymax}`);
        let changed = 0;
        if (ymin < this._bgymin) {
            this._pymin = ymin;
            this._ymin = ymin;
            changed = 1;
        }
        if (ymax > this._bgymax) {
            this._pymax = ymax;
            this._ymax = ymax;
            changed = 1;
        }
        if (changed) {
            this._yscale = (this._ymax-this._ymin)/(this._id.height-1);
            //console.log(`PredYRange reset to ${ymin}:${ymax}`);
        }

        return(changed);
    } 

    getYmin(){
        return this._ymin;
    }
    
    getYmax(){
        return this._ymax;
    }
    
/*
    setBGValue(v) {
        this._bgValue = v;
    }

    setBGUnits(v) {
        this._bgUnits = v;
    }

    bgValue() {
        if (this._bgUnits === 'mmol/L') {
            return(util.oneDecimal(util.mmol(this._bgValue)));
        } else {
            return(this._bgValue);
        }
    }

    bgHigher(v) {
        if (v > 0 && this.bgValue() > v) return true;
        else return false;
    }
    
    bgLower(v) {
        if (v > 0 && this.bgValue() < v) return true;
        else return false;
    }
*/
    setBGColor(c){
        this._bgcolor = c;
        this._bg.style.fill = c;
    }
    
    setUH(l) {
        this._tUH = l;
    }
    setUHC(c){
        this._UHC = c;
    }

    setH(l) {
        this._tHigh = l;
    }
    H(){return this._tHigh}
    HC() {return this._HC}
    setHC(c){
        this._HC = c;
    }
    
    setIRC(c){
        this._IRC = c;
    }

    setL(l) {
        this._tLow = l;
    }
    L(){return this._tLow}
    LC() {return this._LC}
    setLC(c){
        this._LC = c;
    }
    setUL(l) {
        this._tUL = l;
    }
    setULC(c){
        this._ULC = c;
    }
    setPC(c){
        this._PC = c;
    }

    maxBGs() {
        return 48;
    }

    update(bgval, bgdate, caldate, pvals){
        
        //this._bg.style.fill = this._bgcolor;
        let bglength = bgval.length;

        let showPreds = false;
        if (pvals.length > 0) {
            showPreds = true;
            bglength = 24;      // only show 2 hours
        }

        if (this._tHigh <= this._ymax && this._tHigh >= this._ymin) {
            this._tHighL.y1 = this._id.height - ((this._tHigh-this._ymin) / this._yscale);
            this._tHighL.y2 = this._tHighL.y1;
            this._tHighL.x1 = 0;
            this._tHighL.x2 = this._id.width;
            this._tHighL.style.display = "inline";
            this._tHighL.style.fill = this._HC;
            //console.log(`high line at ${this._tHigh}`);
        }
        if (this._tLow >= this._ymin && this._tLow <= this._ymax) {
            this._tLowL.y1 = this._id.height - ((this._tLow-this._ymin) / this._yscale);
            this._tLowL.y2 = this._tLowL.y1;
            this._tLowL.x1 = 0;
            this._tLowL.x2 = this._id.width;
            this._tLowL.style.display = "inline";
            this._tLowL.style.fill = this._LC;
            //console.log(`low line at ${this._tLow}`);
        }
        if (this._tUH <= this._ymax && this._tUH >= this._ymin) {
            this._tUHL.y1 = this._id.height - ((this._tUH-this._ymin) / this._yscale);
            this._tUHL.y2 = this._tUHL.y1;
            this._tUHL.x1 = 0;
            this._tUHL.x2 = this._id.width;
            this._tUHL.style.display = "inline";
            this._tUHL.style.fill = this._UHC;
            //console.log(`Urgent high line at ${this._tUH}`);
        }
        if (this._tUL >= this._ymin && this._tLow <= this._ymax) {
            this._tULL.y1 = this._id.height - ((this._tUL-this._ymin) / this._yscale);
            this._tULL.y2 = this._tULL.y1;
            this._tULL.x1 = 0;
            this._tULL.x2 = this._id.width;
            this._tULL.style.display = "inline";
            this._tULL.style.fill = this._ULC;
            //console.log(`Urgent low line at ${this._tUL}`);
        }

        let firstDate = bgdate[0];
        let lastDate = bgdate[bgdate.length-1];
        let xRange = firstDate - lastDate;
        if (showPreds) {
            xRange += pvals.length * (5*60*1000);
        }

        let usedCal = false;
        if (caldate == 0) usedCal = true;

//        for (var i = 0; i < bgval.length; i++) {
        var i, j;
        for (i = Math.min(bglength-1, this._vals.length-1) , j = 0 ;
             i >= 0 ; i-- , j++) {
            
            this._vals[j].cy = this._id.height - ((bgval[i]-this._ymin) / this._yscale);
            if (!usedCal && caldate <= bgdate[i]) {
                this._vals[j].r = 4;
                usedCal = true; // found the latest calibration time
            } else {
                this._vals[j].r = 2;
            }
            this._vals[j].style.fill = this.setColor(bgval[i]);
            this._vals[j].style.display = "inline";
        }

        let timeval = bgdate[i] + (5*60*1000);
        if (showPreds) {
            for (i = 0 ;
                 i < pvals.length && j < this._vals.length ;
                 i++ , j++) {
                this._vals[j].cy = this._id.height - ((pvals[i]-this._ymin) / this._yscale);
//                let diff = timeval - lastDate;
//                diff = diff / xRange;
//                this._vals[j].cx = (diff * (this._id.width-2)) + 1;
//                this._vals[j].cx = diff * ((this._vals.length) / 2);
                this._vals[j].style.fill = this._PC;
                this._vals[j].style.display = "inline";
                timeval += (5*60*1000);
            }
        }

        while (j < this._vals.length) {
            this._vals[j++].style.display = "none";
        }
    }

    setColor(v) {
        var c;
        
        if (this._UH > 0 && v > this._UH) {
            c =  this._UHC;
        } else if (this._high > 0 && v > this._high) {
            c =  this._HC;
        } else if (this._UL > 0 && v < this._UL) {
            c =  this._ULC;
        } else if (this._low > 0 && v < this._low) {
            c =  this._LC;
        } else {
            c = this._IRC;
        }
        return(c);
    }

    reset(){
        
        for (var index = 0; index < this._vals.length; index++) {
            this._vals[index].style.display = "none";
        }
        this._tHighL.style.display = "none";
        this._tLowL.style.display = "none";
        this._tUHL.style.display = "none";
        this._tULL.style.display = "none";

        this._bgymin = 1000;
        this._bgymax = 0;
        this._pymin = 1000;
        this._pymax = 0;
        this._ymin = 1000;
        this._ymax = 0;
    }

    updateRgraph() {}
};
