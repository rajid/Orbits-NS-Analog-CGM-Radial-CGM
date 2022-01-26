import e from"clock";import t from"document";import{battery as l}from"power";import{display as o}from"display";let r=t.getElementById("hours"),i=t.getElementById("mins"),n=t.getElementById("secs"),s=t.getElementById("hourHand"),a=t.getElementById("hourHandFill"),y=t.getElementById("minHand"),g=t.getElementById("minHandFill"),m=t.getElementById("secHand"),d=t.getElementById("cometorbit"),u=d.getElementById("comet"),c=t.getElementById("grad"),h=!1;function p(e,t){return 30*e+.5*t}function f(e){return 6*e}function C(e){return 6*e}function _(e){return 360/7*e}export class clockFace{constructor(e){this._hourColor="white",this._minColor="white",this._secColor="red",this._gradColor="green"}appName(){return"analogcgm"}aod(e){h=e,this.changeDisplay(h)}changeDisplay(t,l){"true"==`${h}`||o.aodActive&&o.on?(e.granularity="minutes",m.style.display="none",a.style.fill="black",g.style.fill="black",c.style.display="none"):(l?(e.granularity="seconds",m.style.display="inline"):(e.granularity="minutes",m.style.display="none"),a.style.fill=this._hourColor,g.style.fill=this._minColor,c.style.display="inline")}setHourColor(e){this._hourColor=e}setMinColor(e){this._minColor=e}setSecColor(e){this._secColor=e}setGradColor(e){this._gradColor=e}updateClock(e,t,o,h,_,B){let E=l.chargeLevel;if(E=E*(e-t)/100+t,c.gradient.x2=E,c.gradient.y2=E,c.gradient.colors.c1=this._gradColor,r.groupTransform.rotate.angle=p(_.getHours(),_.getMinutes()),i.groupTransform.rotate.angle=f(_.getMinutes()),s.style.fill=this._hourColor,a.style.fill=this._hourColor,y.style.fill=this._minColor,g.style.fill=this._minColor,B?(n.groupTransform.rotate.angle=C(_.getSeconds()),m.style.fill=this._secColor,m.style.display="inline"):m.style.display="none",0!=o&&_>=o){let e,t=h.getHours(),l=h.getMinutes();d.groupTransform.rotate.angle=p(t,l),u.style.display="inline";let r=h.getTime()-_.getTime();if(r<0)e=1;else{h.getTime(),o.getTime()}e>1?e=1:e<0&&(e=0),u.style.fillOpacity=e}else u.style.display="none"}};