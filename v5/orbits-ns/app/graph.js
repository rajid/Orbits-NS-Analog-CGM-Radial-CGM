import{me as t}from"device";t.screen||(t.screen={width:348,height:250});export default class Graph{constructor(t){this._id=t,this._xscale=0,this._yscale=0,this._xmin=1e3,this._xmax=0,this._bgymin=1e3,this._bgymax=0,this._pymin=1e3,this._pymax=0,this._ymin=1e3,this._ymax=0,this._pointsize=2,this._direction="forward",this._bg=this._id.getElementById("bg"),this._vals=this._id.getElementsByClassName("gval"),this._tUH=200,this._tHigh=162,this._tLow=72,this._tUL=60,this._UHC="violet",this._HC="blue",this._IRC="lightgreen",this._LC="pink",this._ULC="red",this._PC="yellow",this._tHighL=this._id.getElementById("tHigh"),this._tLowL=this._id.getElementById("tLow"),this._tUHL=this._id.getElementById("tUrgentHigh"),this._tULL=this._id.getElementById("tUrgentLow"),this._defaultYmin=40,this._defaultYmax=400}setPosition(t,i){this._id.x=t,this._id.y=i}setSize(t,i){this._width=t,this._height=i}setXRange(t,i){this._xmin=t,this._xmax=i,this._xscale=(i-t)/this._width}setBGYRange(t,i){t<this._pymin&&(this._bgymin=t,this._ymin=t),i>this._pymax&&(this._bgymax=i,this._ymax=i),this._yscale=(this._ymax-this._ymin)/(this._id.height-1)}setPredYRange(t,i){let s=0;return t<this._bgymin&&(this._pymin=t,this._ymin=t,s=1),i>this._bgymax&&(this._pymax=i,this._ymax=i,s=1),s&&(this._yscale=(this._ymax-this._ymin)/(this._id.height-1)),s}getYmin(){return this._ymin}getYmax(){return this._ymax}setBGColor(t){this._bgcolor=t,this._bg.style.fill=t}setUH(t){this._tUH=t}setUHC(t){this._UHC=t}setH(t){this._tHigh=t}H(){return this._tHigh}HC(){return this._HC}setHC(t){this._HC=t}setIRC(t){this._IRC=t}setL(t){this._tLow=t}L(){return this._tLow}LC(){return this._LC}setLC(t){this._LC=t}setUL(t){this._tUL=t}setULC(t){this._ULC=t}setPC(t){this._PC=t}maxBGs(){return 48}update(t,i,s,h){let _=t.length,e=!1;h.length>0&&(e=!0,_=24),this._tHigh<=this._ymax&&this._tHigh>=this._ymin&&(this._tHighL.y1=this._id.height-(this._tHigh-this._ymin)/this._yscale,this._tHighL.y2=this._tHighL.y1,this._tHighL.x1=0,this._tHighL.x2=this._id.width,this._tHighL.style.display="inline",this._tHighL.style.fill=this._HC),this._tLow>=this._ymin&&this._tLow<=this._ymax&&(this._tLowL.y1=this._id.height-(this._tLow-this._ymin)/this._yscale,this._tLowL.y2=this._tLowL.y1,this._tLowL.x1=0,this._tLowL.x2=this._id.width,this._tLowL.style.display="inline",this._tLowL.style.fill=this._LC),this._tUH<=this._ymax&&this._tUH>=this._ymin&&(this._tUHL.y1=this._id.height-(this._tUH-this._ymin)/this._yscale,this._tUHL.y2=this._tUHL.y1,this._tUHL.x1=0,this._tUHL.x2=this._id.width,this._tUHL.style.display="inline",this._tUHL.style.fill=this._UHC),this._tUL>=this._ymin&&this._tLow<=this._ymax&&(this._tULL.y1=this._id.height-(this._tUL-this._ymin)/this._yscale,this._tULL.y2=this._tULL.y1,this._tULL.x1=0,this._tULL.x2=this._id.width,this._tULL.style.display="inline",this._tULL.style.fill=this._ULC);let l=i[0]-i[i.length-1];e&&(l+=3e5*h.length);let y=!1;var n,L;for(0==s&&(y=!0),n=Math.min(_-1,this._vals.length-1),L=0;n>=0;n--,L++)this._vals[L].cy=this._id.height-(t[n]-this._ymin)/this._yscale,!y&&s<=i[n]?(this._vals[L].r=4,y=!0):this._vals[L].r=2,this._vals[L].style.fill=this.setColor(t[n]),this._vals[L].style.display="inline";let a=i[n]+3e5;if(e)for(n=0;n<h.length&&L<this._vals.length;n++,L++)this._vals[L].cy=this._id.height-(h[n]-this._ymin)/this._yscale,this._vals[L].style.fill=this._PC,this._vals[L].style.display="inline",a+=3e5;for(;L<this._vals.length;)this._vals[L++].style.display="none"}setColor(t){return this._UH>0&&t>this._UH?this._UHC:this._high>0&&t>this._high?this._HC:this._UL>0&&t<this._UL?this._ULC:this._low>0&&t<this._low?this._LC:this._IRC}reset(){for(var t=0;t<this._vals.length;t++)this._vals[t].style.display="none";this._tHighL.style.display="none",this._tLowL.style.display="none",this._tUHL.style.display="none",this._tULL.style.display="none",this._bgymin=1e3,this._bgymax=0,this._pymin=1e3,this._pymax=0,this._ymin=1e3,this._ymax=0}updateRgraph(){}};
