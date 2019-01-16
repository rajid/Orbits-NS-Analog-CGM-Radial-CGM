import { me as device } from "device";

// Screen dimension fallback for older firmware
if (!device.screen) device.screen = { width: 348, height: 250 };

export default class Graph {
    
    constructor(id) {
        
        this._id = id;
        this._xscale = 0;
        this._yscale = 0;
        this._xmin = 0;
        this._xmax = 0;
        this._ymin = 0;
        this._ymax = 0;
        this._pointsize = 2;   
        this._direction = "forward"; // or "reverse"
        
        this._bg = this._id.getElementById("bg");
        
        this._vals = this._id.getElementsByClassName("gval");
        
        this._tUH = 200;
        this._tHigh = 162;
        this._tLow = 72;
        this._tUL = 60;

        this._urgentHighColor = "violet";
        this._highColor = "blue";
        this._inRangeColor = "lightgreen";
        this._lowColor = "pink";
        this._urgentLowColor = "red";
        
        this._tHighLine = this._id.getElementById("tHigh");
        this._tLowLine = this._id.getElementById("tLow");
        this._tUHLine = this._id.getElementById("tUrgentHigh");
        this._tULLine = this._id.getElementById("tUrgentLow");
        
        this._defaultYmin = 40;
        this._defaultYmax = 400;
        
        this._bgValue = 0;
        this._bgUnits = "bg/dL";
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
    
    setYRange(ymin, ymax){
        
        this._ymin = ymin;
        this._ymax = ymax;
        this._yscale = (ymax-ymin)/this._id.height;
        //console.log("YSCALE: " + this._yscale);
        
    } 

    getYmin(){
        return this._ymin;
    }
    
    getYmax(){
        return this._ymax;
    }
    
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
    setBGColor(c){
        this._bgcolor = c;
        this._bg.style.fill = c;
    }
    
    setUH(l) {
        this._tUH = l;
    }
    setUHColor(c){
        this._urgentHighColor = c;
    }

    setH(l) {
        this._tHigh = l;
    }
    H(){return this._tHigh}
    HC() {return this._highColor}
    setHColor(c){
        this._highColor = c;
    }
    
    setIRColor(c){
        this._inRangeColor = c;
    }

    setL(l) {
        this._tLow = l;
    }
    L(){return this._tLow}
    LC() {return this._lowColor}
    setLColor(c){
        this._lowColor = c;
    }
    setUL(l) {
        this._tUL = l;
    }
    setULColor(c){
        this._urgentLowColor = c;
    }

    maxBGs() {
        return 24;
    }

    update(v){
        
        //this._bg.style.fill = this._bgcolor;
        
        if (this._tHigh <= this._ymax && this._tHigh >= this._ymin) {
            this._tHighLine.y1 = this._id.height - ((this._tHigh-this._ymin) / this._yscale);
            this._tHighLine.y2 = this._tHighLine.y1;
            this._tHighLine.x1 = 0;
            this._tHighLine.x2 = this._id.width;
            this._tHighLine.style.display = "inline";
            this._tHighLine.style.fill = this._highColor;
            //console.log(`high line at ${this._tHigh}`);
        }
        if (this._tLow >= this._ymin && this._tLow <= this._ymax) {
            this._tLowLine.y1 = this._id.height - ((this._tLow-this._ymin) / this._yscale);
            this._tLowLine.y2 = this._tLowLine.y1;
            this._tLowLine.x1 = 0;
            this._tLowLine.x2 = this._id.width;
            this._tLowLine.style.display = "inline";
            this._tLowLine.style.fill = this._lowColor;
            //console.log(`low line at ${this._tLow}`);
        }
        if (this._tUH <= this._ymax && this._tUH >= this._ymin) {
            this._tUHLine.y1 = this._id.height - ((this._tUH-this._ymin) / this._yscale);
            this._tUHLine.y2 = this._tUHLine.y1;
            this._tUHLine.x1 = 0;
            this._tUHLine.x2 = this._id.width;
            this._tUHLine.style.display = "inline";
            this._tUHLine.style.fill = this._urgentHighColor;
            //console.log(`Urgent high line at ${this._tUH}`);
        }
        if (this._tUL >= this._ymin && this._tLow <= this._ymax) {
            this._tULLine.y1 = this._id.height - ((this._tUL-this._ymin) / this._yscale);
            this._tULLine.y2 = this._tULLine.y1;
            this._tULLine.x1 = 0;
            this._tULLine.x2 = this._id.width;
            this._tULLine.style.display = "inline";
            this._tULLine.style.fill = this._urgentLowColor;
            //console.log(`Urgent low line at ${this._tUL}`);
        }

        let firstDate = v[0].d;
        let lastDate = v[v.length-1].d;
        let xRange = firstDate - lastDate;

        for (var index = 0; index < v.length; index++) {
            
            let i = v.length-1-index;
            this._vals[index].cy = this._id.height - ((v[i].s-this._ymin) / this._yscale);
            let diff = v[i].d-lastDate;
            diff = diff / xRange;
            this._vals[index].cx = (diff * (this._id.width-2)) + 1;
            if (v[i].c) {
                this._vals[index].r = 4;
            } else {
                this._vals[index].r = 2;
            }
            this._vals[index].style.fill = this.setColor(v[i].s);
            this._vals[index].style.display = "inline";
        }
        
        
    }

    setColor(v) {
        var c;
        
        if (this._tUH > 0 && v > this._tUH) {
            c =  this._urgentHighColor;
        } else if (this._tHigh > 0 && v > this._tHigh) {
            c =  this._highColor;
        } else if (this._tUL > 0 && v < this._tUL) {
            c =  this._urgentLowColor;
        } else if (this._tLow > 0 && v < this._tLow) {
            c =  this._lowColor;
        } else {
            c = this._inRangeColor;
        }
        return(c);
    }

    reset(){
        
        for (var index = 0; index < this._vals.length; index++) {
            this._vals[index].style.display = "none";
        }
        this._tHighLine.style.display = "none";
        this._tLowLine.style.display = "none";
        this._tUHLine.style.display = "none";
        this._tULLine.style.display = "none";
    }

    updateRgraph() {}
};
