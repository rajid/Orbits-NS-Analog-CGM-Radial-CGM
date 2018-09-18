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
        
        this._tUrgentHigh = 200;
        this._tHigh = 162;
        this._tLow = 72;
        this._tUrgentLow = 60;

        this._urgentHighColor = "white";
        this._highColor = "white";
        this._urgentLowColor = "white";
        this._lowColor = "white";
        this._inRangeColor = "white";
        
        this._tHighLine = this._id.getElementById("tHigh");
        this._tLowLine = this._id.getElementById("tLow");
        this._tUrgentHighLine = this._id.getElementById("tUrgentHigh");
        this._tUrgentLowLine = this._id.getElementById("tUrgentLow");
        
        this._defaultYmin = 40;
        this._defaultYmax = 400;
        
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
    
    setBGColor(c){
        this._bgcolor = c;
        this._bg.style.fill = c;
    }
    
    setHighLimit(l) {
        this._tHigh = l;
    }
    setHighColor(c){
        this._highColor = c;
    }
    
    
    setLowLimit(l) {
        this._tLow = l;
    }
    setLowColor(c){
        this._lowColor = c;
    }
    
    setUrgentHighLimit(l) {
        this._tUrgentHigh = l;
        this._tUrgentHighLine.style.fill = "red";
    }
    setUrgentHighColor(c){
        this._urgentHighColor = c;
    }
    
    setUrgentLowLimit(l) {
        this._tUrgentLow = l;
        this._tUrgentLowLine.style.fill = "red";
    }
    setUrgentLowColor(c){
        this._urgentLowColor = c;
    }

    setInRangeColor(c){
        this._inRangeColor = c;
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
            console.log(`high line at ${this._tHigh}`);
        }
        if (this._tLow >= this._ymin && this._tLow <= this._ymax) {
            this._tLowLine.y1 = this._id.height - ((this._tLow-this._ymin) / this._yscale);
            this._tLowLine.y2 = this._tLowLine.y1;
            this._tLowLine.x1 = 0;
            this._tLowLine.x2 = this._id.width;
            this._tLowLine.style.display = "inline";
            this._tLowLine.style.fill = this._lowColor;
            console.log(`low line at ${this._tLow}`);
        }
        if (this._tUrgentHigh <= this._ymax && this._tUrgentHigh >= this._ymin) {
            this._tUrgentHighLine.y1 = this._id.height - ((this._tUrgentHigh-this._ymin) / this._yscale);
            this._tUrgentHighLine.y2 = this._tUrgentHighLine.y1;
            this._tUrgentHighLine.x1 = 0;
            this._tUrgentHighLine.x2 = this._id.width;
            this._tUrgentHighLine.style.display = "inline";
            this._tUrgentHighLine.style.fill = this._urgentHighColor;
            console.log(`Urgent high line at ${this._tUrgentHigh}`);
        }
        if (this._tUrgentLow >= this._ymin && this._tLow <= this._ymax) {
            this._tUrgentLowLine.y1 = this._id.height - ((this._tUrgentLow-this._ymin) / this._yscale);
            this._tUrgentLowLine.y2 = this._tUrgentLowLine.y1;
            this._tUrgentLowLine.x1 = 0;
            this._tUrgentLowLine.x2 = this._id.width;
            this._tUrgentLowLine.style.display = "inline";
            this._tUrgentLowLine.style.fill = this._urgentLowColor;
            console.log(`Urgent low line at ${this._tUrgentLow}`);
        }

        let firstDate = v[0].date;
        let lastDate = v[v.length-1].date;
        let xRange = firstDate - lastDate;

        for (var index = 0; index < v.length; index++) {
            
            let i = v.length-1-index;
            this._vals[index].cy = this._id.height - ((v[i].sgv-this._ymin) / this._yscale);
            let diff = v[i].date-lastDate;
            diff = diff / xRange;
            this._vals[index].cx = (diff * (this._id.width-2)) + 1;
            if (v[i].cal) {
                this._vals[index].r = 4;
            } else {
                this._vals[index].r = 2;
            }
            this._vals[index].style.fill = this.setColor(v[i].sgv);
            this._vals[index].style.display = "inline";
        }
        
        
    }

    setColor(v) {
        var c;
        
        if (this._tUrgentHigh > 0 && v > this._tUrgentHigh) {
            c =  this._urgentHighColor;
        } else if (this._tHigh > 0 && v > this._tHigh) {
            c =  this._highColor;
        } else if (this._tUrgentLow > 0 && v < this._tUrgentLow) {
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
        this._tUrgentHighLine.style.display = "none";
        this._tUrgentLowLine.style.display = "none";
    }

};
