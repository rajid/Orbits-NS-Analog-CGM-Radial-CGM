import e from"clock";import t from"document";import{battery as r}from"power";import{display as n}from"display";let o=t.getElementById("clock"),l=o.getElementById("clockFace"),a=t.getElementById("star"),g=l.getElementById("orbit"),i=g.getElementById("moonorbit"),m=g.getElementById("earth"),s=t.getElementById("earthImage"),u=i.getElementById("moon"),y=t.getElementById("moonImage"),c=l.getElementById("belt"),p=c.getElementById("asteroid"),d=l.getElementById("rays"),f=l.getElementById("cometorbit"),I=f.getElementById("comet"),h=!1;function B(e,t){return 30*e+.5*t}function E(e,t){return 6*e-t}function T(e){return 6*e}function b(e){return 360/7*e}export class clockFace{constructor(e){}appName(){return"orbitsns"}aod(e){h=e,this.changeDisplay(h)}changeDisplay(t){"true"==`${h}`||n.aodActive&&n.on?(e.granularity="minutes",s.href="earthOutline.png",y.href="moonOutline.png",a.href="starOutline.png"):(e.granularity="seconds",s.href="earth_only.png",y.href="moon_only.png",a.href="star_only.png")}setHourColor(e){}setMinColor(e){}setSecColor(e){}setGradColor(e){}updateClock(e,t,n,o,l,a){let s=r.chargeLevel;s=s*(e-t)/100+t,d.gradient.x2=s,d.gradient.y2=s;let y=B(l.getHours(),l.getMinutes());g.groupTransform.rotate.angle=y;let h=E(l.getMinutes,y);for(;h<0;)h+=360;m.style.display="inline",m.groupTransform.rotate.angle=0-y;let T=360*l.getMinutes()/60;i.groupTransform.rotate.angle=T,u.groupTransform.rotate.angle=0-T;let k=b(l.getDay());if(c.groupTransform.rotate.angle=k,p.groupTransform.rotate.angle=E(l.getSeconds(),0),0!=n&&l>=n){let e,t=o.getHours(),r=o.getMinutes();f.groupTransform.rotate.angle=B(t,r),I.style.display="inline";let a=o.getTime()-l.getTime();if(a<0)e=1;else{o.getTime(),n.getTime()}e>1?e=1:e<0&&(e=0),I.style.fillOpacity=e}else I.style.display="none"}};
