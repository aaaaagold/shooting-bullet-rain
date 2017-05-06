
"use strict";

const NULL=null;
let tmp;
const undefObj=tmp;
//var undef="undefined";
const undef=typeof undefObj;
const UNDEF=undef;
function z(t,a,i){return "<"+t+" "+a+">"+i+"</"+t+">"}
var d=document;
//function numDelta(str,delta){return str.replace(/\-?[0-9]+\.?[0-9]*/g,function(m){return m!=""?Number(m)+delta:""})}
function ge(id){return d.getElementById(id)}
function ce(tag){return d.createElement(tag)}
function ct(txt){return d.createTextNode(txt)}
function sa(o,att,inn){o.setAttribute(att,inn);return o}
function ga(o,att){return o.getAttribute(att)}
function ac(o,c){o.appendChild(c);return o}
function rmca(o){while(o.childNodes.length)o.removeChild(o.childNodes[0]);return o}
function ae(o,e,f){
	if(o.attachEvent) o.attachEvent("on"+e,f);
	else if(o.addEventListener) o.addEventListener(e,f);
	else console.log("function ae: not support");
	return o;
}
function c2i(s){return s.charCodeAt(0)}
function isundef(v){return (v==undefObj)}

function gcd(a,b){
	var s,t;
	if(a==b || b==0) return a;
	if(a==0) return b;
	for(var s=0;((a|b)&1)==0;s++){ a>>=1; b>>=1; }
	while((a&1)==0) a>>=1;
	do{
		while((b&1)==0) b>>=1;
		if(a>b){ t=a; a=b; b=t; }
		b-=a;
	}while(b);
	return a<<s;
}
function avgvw(v1,w1,v2,w2){ return (v1*w1+v2*w2)/(w1+w2); }
function dist(xy1,xy2){
	var sq=0;
	var xs=(xy2!=undefObj && xy1.length<xy2.length)?xy2.length:xy1.length;
	for(var x=0;x<xs;x++){
		var d=0;
		if(xy1[x]!=undefObj) d+=xy1[x];
		if(xy2!=undefObj && xy2[x]!=undefObj) d-=xy2[x];
		sq+=d*d;
	}
	return Math.sqrt(sq);
}
function vecA2B(A,B){
	var rtv=[];
	var M=Math.max(A.length,B.length);
	var m=Math.min(A.length,B.length);
	for(var x=0;x<m;x++) rtv[x]=B[x]-A[x];
	if(M==B.length) for(var x=m;x<M;x++) rtv[x]=B[x];
	else for(var x=m;x<M;x++) rtv[x]=-A[x];
	return rtv;
}
function outOfRange(pt,min,max){
	if(typeof pt=="object"){
		var rtv=false;
		for(var x=0;x<pt.length;x++)
			rtv=rtv||pt[x]>max[x]||pt[x]<min[x];
		return rtv;
	}
	return pt>max || pt<min;
}
function strictAbsTo(n,to){
	return (to<0)?0:((n*n<to*to)?n:(n<0?-to:to));
}
function strictInRange(n,l,r){
	return r<l?n:n>r?r:n<l?l:n;
}
function lowerbound(arr,n){
	var l=0,r=arr.length;
	for(var m=(l+r)>>1;l!=m;m=(l+r)>>1){
		if(n<arr[m]) r=m;
		else l=m;
	} 
	return l + (n>arr[m]);
}

function newImg(id,path){return sa(sa(ce('img'),'id',id),'src',path)}
function setImg(id,path){return sa(ge(id),'src',path)}

function newCanvas(width,height){
	if(width==undefObj) width=0;
	if(height==undefObj) height=0;
	return sa(sa(sa(ce('canvas'),'width',width),'height',height),'style','left:-'+width/2+'px;');
}
function drawImg(c,img,deg,w,h,strtX,strtY,ratioX,ratioY){
	var stx=(strtX!=undefObj)?Number(strtX):0;
	var sty=(strtY!=undefObj)?Number(strtY):0;
	var bw=img.width;
	var bh=img.height;
	var rx=(ratioX!=undefObj)?ratioX:1;
	var ry=(ratioY!=undefObj)?ratioY:1;
	var dw=bw*rx,dh=bh*ry;
	if(dw<0){ dw=-dw; }
	if(dh<0){ dh=-dh; }
	var newW=(w!=undefObj)?w:dw;
	if(c.width!=newW) c.width=newW;
	var newH=(h!=undefObj)?h:dh;
	if(c.height!=newH)c.height=newH;
	var ctx = c.getContext("2d");
	if(rx<0){ ctx.scale(-1,1); ctx.translate(-dw,0); }
	if(ry<0){ ctx.scale(1,-1); ctx.translate(0,-dh); }
	if(typeof deg=="number"){
		ctx.translate(dw/2,dh/2);
		ctx.rotate(deg*Math.PI/180);
		ctx.translate(-dw/2,-dh/2);
	}
	ctx.drawImage(img, 0, 0, bw, bh, stx, sty, dw, dh);
	return sa(c,'style','left:-'+dw/2+'px;top:-'+dh/2+'px;');
}
function drawImgS(img,rowLen,colLen,deg,strtX,strtY,ratio){ // serial imgages
	var rtv={};
	rtv.length=rowLen*colLen;
	var stx=0; if(strtX!=undefObj) stx=Number(strtX);
	var sty=0; if(strtY!=undefObj) sty=Number(strtY);
	var r=1; if(ratio!=undefObj) r=ratio;
	// w,h: width,height of a block (outer)
	var w=(img.width/rowLen), h=(img.height/colLen);
	// bw,bh: width,height of a block (inner)
	var bw=w-1,bh=h-1;
	// dw,dh: width,height of draw
	var dw=w*r,dh=h*r;
	for(var y=0;y<colLen;y++){
		for(var x=0;x<rowLen;x++){
			var c=ce('canvas'); c.width=dw; c.height=dh;
			var ctx=c.getContext("2d");
			if(typeof deg=="number"){
				ctx.translate(c.width/2,c.height/2);
				ctx.rotate(deg*Math.PI/180);
				ctx.translate(-c.width/2,-c.height/2);
			}
			ctx.drawImage(img, x*w, y*h, bw, bh, -stx, -sty, dw, dh);
			// src, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH
			rtv[y*rowLen+x]=(sa(c,'style','left:-'+dw/2+'px;top:-'+dh/2+'px;'));
		}
	}
	return rtv;
}
function drawPoly(c,pt2d_vec,lineColor,width,fillColor){
	var pv=pt2d_vec;
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.lineWidth=width.toString();
	ctx.moveTo(pv[0][0],pv[0][1]);
	for(var x=1;x<pv.length;x++) ctx.lineTo(pv[x][0],pv[x][1]);
	if(fillColor!=undefObj){ ctx.fillStyle=fillColor.toString(); ctx.fill(); }
	if(lineColor!=undefObj){ ctx.strokeStyle=lineColor.toString(); ctx.stroke(); }
	return sa(c,'style','left:-'+c.width/2+'px;top:-'+c.height/2+'px;');
}
function drawArc(c,centerXY,r,angleSE,lineColor,width,fillColor){
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.lineWidth=width.toString();
	ctx.arc(centerXY[0],centerXY[1],r,angleSE[0],angleSE[1]);
	if(fillColor!=undefObj){ ctx.fillStyle=fillColor.toString(); ctx.fill(); }
	if(lineColor!=undefObj){ ctx.strokeStyle=lineColor.toString(); ctx.stroke(); }
	return sa(c,'style','left:-'+c.width/2+'px;top:-'+c.height/2+'px;');
}
function drawFont(c,fontString,fontSize,color,typeface){
	if(typeface==undefObj) typeface="Arial";
	var ctx = c.getContext("2d");
	if(fontSize!=undefObj) ctx.font="800 "+fontSize+" "+typeface;
	if(color!=undefObj) ctx.fillStyle=color;
	ctx.fillText(fontString,-c.width/64,c.height);
	return sa(c,'style','left:-'+(c.width/2)+'px;top:-'+c.height/2+'px;');
}
function clearCanvas(c)
{
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	return c;
}
function pasteCanvas(dst,src){
	var ctx = dst.getContext("2d");
	ctx.drawImage(src,0,0);
	return dst;
}

var minArr={};
minArr.new=function newMinArr(){
	var rtv={}; rtv.length=arguments.length;
	for(var x=0;x<arguments.length;x++)
		rtv[x]=arguments[x];
	return rtv;
};
minArr.copy=function copyMinArr(arr){
	var rtv={}; rtv.length=arr.length;
	for(var x=0;x<arr.length;x++)
		rtv[x]=arr[x];
	return rtv;
};
minArr.minus=function minusMinArr(arrL,arrR){
	var rtv={};
	if(arrL.length<arrR.length){
		rtv.length=arrR.length;
		for(var x=0;x<arrL.length;x++) rtv[x]=arrL[x]-arrR[x];
		for(var x=arrL.length;x<arrR.length;x++) rtv[x]=-arrR[x];
	}else{
		rtv.length=arrL.length;
		for(var x=0;x<arrR.length;x++) rtv[x]=arrL[x]-arrR[x];
		for(var x=arrR.length;x<arrL.length;x++) rtv[x]=-arrL[x];
	}
	return rtv;
};
minArr.add=function addMinArr(arrL,arrR){
	var rtv={};
	if(arrL.length<arrR.length){
		rtv.length=arrR.length;
		for(var x=0;x<arrL.length;x++) rtv[x]=arrL[x]+arrR[x];
		for(var x=arrL.length;x<arrR.length;x++) rtv[x]=arrR[x];
	}else{
		rtv.length=arrL.length;
		for(var x=0;x<arrR.length;x++) rtv[x]=arrL[x]+arrR[x];
		for(var x=arrR.length;x<arrL.length;x++) rtv[x]=arrL[x];
	}
	return rtv;
};

