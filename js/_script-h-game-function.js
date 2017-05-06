
"use strict";

function newIP(id,path){var rtv=[];rtv.id=id;rtv.path=path;return rtv;}
function newTB(id,imgid,deg,kb){var rtv=[];rtv.id=id;rtv.imgid=imgid;rtv.deg=deg;rtv.kb=kb;return rtv;}
// 
function newMap(dimRanges,deltas){
	function newMap_recur(dimRanges,deltas){
		var rtv=[];
		if(deltas.length!=0){
			var rtvlen=parseInt(1+(dimRanges[0][1]-dimRanges[0][0])/deltas[0]);
			var nextDim=[],nextDel=[];
			for(var x=1;x<dimRanges.length;x++) nextDim[x-1]=dimRanges[x];
			for(var x=1;x<deltas.length;x++) nextDel[x-1]=deltas[x];
			for(var x=0;x<rtvlen;x++) rtv[x]=newMap_recur(nextDim,nextDel);
		}
		return rtv;
	}
	function _newBlk(gcLens){
		function newBlk_recur(arr,st,ed,lv){
			if(st+2>=ed) return;
			arr.lv=lv;
			var tmp={};
			tmp.min=st;
			tmp.max=ed;
			tmp.sth=0;
			arr.push(tmp);
			var m=(st+ed)>>1;
			newBlk_recur(arr,st,m,lv+1);
			newBlk_recur(arr,m,ed,lv+1);
		}
		var rtv=[];
		for(var x=0;x<lens.length;x++){
			rtv[x]=[];
			//rtv[x].lv=0; // merged into new_recur()
			newBlk_recur(rtv[x],0,gcLens[x]+1);
		}
	}
	if(dimRanges.length!=deltas.length) throw "lengths dismatch";
	// if(dimRanges.length==0) return rtv; // store ptrs2objs
	var rtv={};
	var self=rtv;
	rtv.deltas=[];
	for(var x=0;x<deltas.length;x++) rtv.deltas[x]=deltas[x];
	rtv.dimRanges=[];
	for(var x=0;x<dimRanges.length;x++){
		rtv.dimRanges[x]=[];
		rtv.dimRanges[x][0]=dimRanges[x][0];
		rtv.dimRanges[x][1]=dimRanges[x][1];
	}
	rtv._getGridCoord=function(self,coord){
		var rtv={};
		rtv.length=coord.length;
		for(var x=0;x<coord.length;x++)
			rtv[x]=parseInt((coord[x]-self.dimRanges[x][0])/self.deltas[x]);
		return rtv;
	};
	rtv.getGridCoord=function(coord){this._getGridCoord(this,coord);};
	var tmp=[];
	for(var x=0;x<rtv.dimRanges.length;x++) tmp[x]=rtv.dimRanges[x][1];
	// [[including,including], ... ]
	rtv.gcLens=rtv._getGridCoord(rtv,tmp);
	rtv._getListAt=function(self,coord){
		if(coord.length!=self.dimRanges.length) throw "lengths dismatch";
		var gc=self._getGridCoord(self,coord);
		for(var x=0;x<gcLens.length;x++)
			if(gc[x]<0 || gc[x]>self.gcLens[x])
				return null;
		var rtv=self.arr;
		for(var x=0;x<coord.length;x++) rtv=rtv[gc[x]];
		return rtv;
	}; // list of Objs
	rtv.getListAt=function(coord){this._getListAt(this,coord);};
	rtv._objRange2gcRange=function(self,obj){
		// [[including,including], ... ]
		var objRangeMin=[],objRangeMax=[];
		for(var x=0;x<obj.XY.length;x++){
			var w=obj.WH[x]/2;
			var c=obj.XY[x];
			objRangeMin[x]=c-w;
			objRangeMax[x]=c+w;
		}
		// [[including,including], ... ]
		var gcRange={},gcRangeMin=self._getGridCoord(self,objRangeMin),gcRangeMax=self._getGridCoord(self,objRangeMax);
		gcRange.length=gcRangeMin.length;
		for(var x=0;x<gcRangeMin.length;x++)
			gcRange[x]=[
				strictInRange(gcRangeMin[x],0,self.gcLens[x]),
				strictInRange(gcRangeMax[x],0,self.gcLens[x]),
			];
		return gcRange;
	};
	rtv.objRange2gcRange=function(obj){return this._objRange2gcRange(this,obj);};
	rtv._remove_recur=function remove_recur(obj,subMap,gcRange){
		if(gcRange.length==0){
			for(var x=0;x<subMap.length;x++)
				if(subMap[x].id==obj.id){
					if(x+1!=subMap.length) subMap[x]=subMap[subMap.length-1];
					subMap.pop();
				}
			return;
		}
		var nextGcRange={};
		nextGcRange.length=gcRange.length-1;
		for(var x=1;x<gcRange.length;x++) nextGcRange[x-1]=gcRange[x];
		for(var x=gcRange[0][0];x<=gcRange[0][1];x++)
			remove_recur(obj,subMap[x],nextGcRange);
	};
	rtv.remove=function(obj){this._remove_recur(obj,this.arr,this._objRange2gcRange(this,obj));};
	rtv._updateTo_recur_place=function updateTo_recur_place(self,obj,subMap,gcRange){
		if(gcRange.length==0){
			subMap.push(obj);
			return;
		}
		var nextGcRange={};
		nextGcRange.length=gcRange.length-1;
		for(var x=1;x<gcRange.length;x++) nextGcRange[x-1]=gcRange[x];
		for(var x=gcRange[0][0];x<=gcRange[0][1];x++)
			updateTo_recur_place(self,obj,subMap[x],nextGcRange);
	};
	rtv._updateTo=function(self,obj,coord){
		if(coord.length!=self.gcLens.length || obj.XY.length!=coord.length) throw "lengths dismatch";
		self.remove(obj);
		for(var x=0;x<obj.XY.length;x++) obj.XY[x]=coord[x];
		self._updateTo_recur_place(self,obj,self.arr, self._objRange2gcRange(self,obj));
	};
	rtv.updateTo=function(obj,coord){this._updateTo(this,obj,coord);};
	rtv._cleanList_recur=function cleanList_recur(lv,arr){
		if(lv==0) arr.length=0;
		else for(var x=0;x<arr.length;x++) cleanList_recur(lv-1,arr[x]); 
	};
	rtv.cleanList=function(){this._cleanList_recur(this.gcLens.length,this.arr);};
	rtv._getNear_recur=function getNear_recur(lv, obj, mapArr, IDPrefix, gcRange, currFoundDict,currFoundArr){
		var it=gcRange.length-lv;
		if(lv==0) for(var x=0;x<mapArr.length;x++){
				//console.log("debug counter");
				if(mapArr[x].id.slice(0,IDPrefix.length)!=IDPrefix || currFoundDict[mapArr[x].id]) continue;
				currFoundDict[mapArr[x].id]=1;
				currFoundArr.push(mapArr[x]);
			}
		else for(var x=gcRange[it][0];x<=gcRange[it][1];x++) getNear_recur(lv-1, obj, mapArr[x], IDPrefix, gcRange, currFoundDict,currFoundArr);
	};
	rtv._getNear=function(self,obj,IDPrefix){ // obj here means: boss or players or theWindow
		var dict={},arr=[];
		self._getNear_recur(self.gcLens.length, obj, self.arr, IDPrefix, self.objRange2gcRange(obj), dict,arr );
		return arr;
	};
	rtv.getNear=function(obj,IDPrefix){return this._getNear(this,obj,IDPrefix);};
	rtv.arr=newMap_recur(dimRanges,deltas);
	//rtv.blk=[];
	return rtv;
// debug
// var tttt=newMap([[minX,maxX],[minY,maxY]],[100,100]);tttt.updateTo(game.bullets[0],[0,0]);tttt.arr[0][0];
// for(var x=0;x<tttt.arr.length;x++)for(var y=0;y<tttt.arr[x].length;y++)if(tttt.arr[x][y].length)console.log(tttt.arr[x][y]);
//
}
// 
//function animatedList(length){}
// 
// obj
function packObj(objs){
	var divs={};
	divs.length=objs.length;
	for(var x=0;x<objs.length;x++)
	{
		divs[x]=sa(ce('div'),'style',"left:"+objs[x].XY[0]+"px;top:"+objs[x].XY[1]+"px;");
		sa(ac(divs[x],(objs[x].animated)?objs[x].canvas[0]:objs[x].canvas),'id',objs[x].id);
	}
	return divs;
}
// effects
function newHitEffectCanvasStr(initSizeW,initSizeH,scaleIncDelta,frameNum,RGBnums,alpha,str){
	var rtv={};
	rtv.length=frameNum;
	for(var x=0;x<frameNum;x++){
		var coef=1+x*scaleIncDelta;
		rtv[x]=drawFont(newCanvas(initSizeW*coef,initSizeH*coef),
			str,initSizeH*coef*1.75+'px',
			"rgba("+RGBnums[0]+','+RGBnums[1]+','+RGBnums[2]+','+alpha*((frameNum-x)/frameNum)+")");
	}
	return rtv;
}
// drops
function newDropCanvasImg(img,scale,type,info){
	var rtv={};
	switch(type){
	case "roll":
		rtv.length=info.x*info.y/gcd(info.x,info.y);
		var xc=2*Math.PI/info.x,yc=2*Math.PI/info.y;
		for(var x=0;x<rtv.length;x++) rtv[x]=drawImg(newCanvas(),img,0,undefObj,undefObj,undefObj,undefObj,scale*Math.cos(x*xc),scale*Math.cos(x*yc));
		break;
	default:
		return drawImg(newCanvas(),img);
		break;
	}
	return rtv;
}

