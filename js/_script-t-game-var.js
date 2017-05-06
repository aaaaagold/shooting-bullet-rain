
"use strict";

// constants
//   html ele
var htmlEle={};
htmlEle.playView=new htmlGamePlayView(consts.playViewInner,consts.playViewOuter);
htmlEle.playViewBg=new htmlGamePlayView(consts.playViewBgInner);
htmlEle.blk=new htmlGamePlayBlk(
	consts.playerID,
	consts.bossID,
	consts.bulletPlayerID,
	consts.bulletBossID,
	consts.hitEffectID,
	consts.dropID
);
htmlEle.msg={};
	htmlEle.msg.pause=ge(consts.playMsgPause);
	htmlEle.msg.start=ge(consts.playMsgStart);
	htmlEle.msg.boss=ge(consts.msgBossID);
	htmlEle.msg.skill=ge(consts.msgSkID);
	htmlEle.msg.oth=ge(consts.msgOthID);
	htmlEle.msg.sys=ge(consts.msgSysID);
	//   msg2player
	htmlEle.msg.helpString="move by W,A,S,D\nP for pause or not\nH for this page\nR for restart page\nO for fire bullet(s)\nM for muted or not\n\nIf you use touchpad, touch on \"Touch mode\" on the right\n\nThe green dot is a hint where the boss is";
htmlEle.ende={
	"parent":ge(consts.endblk),
	"lose":ge(consts.endLose),
	"win":ge(consts.endWin)
};
htmlEle.menu={
	"readme":ge(consts.menuReadme),
	"rankView":ge(consts.menuRankView),
	"rankSubmit":ge(consts.menuRankSubmit),
	"restart":ge(consts.btnRestart)
};
htmlEle.menuFunction={
	"pause":ge(consts.menuPause),
	"auto":{
		"move":ge(consts.menuAutoMove),
		"shot":ge(consts.menuAutoShot)
	},
	"mute":ge(consts.menuMute)
};
htmlEle.status={};
	htmlEle.status.boss={
		"parent":ge(consts.bossStatID),
		"hp":ge(consts.bossStatID+'-hp'),
		"mp":ge(consts.bossStatID+'-mp')
	};
	htmlEle.status.player={
		"parent":ge(consts.playerStatID),
		"hp":ge(consts.playerStatID+'-hp'),
		"mp":ge(consts.playerStatID+'-mp')
	};
	htmlEle.status.time={
		"parent":ge(consts.timeStatID),
		"data":ge(consts.timeStatID+'-data')
	};
htmlEle.ptr={};
	htmlEle.ptr.boss=ge(consts.bossPtrID);
htmlEle.sound={};
	htmlEle.sound.global={
		"shot":new htmlSound(consts.soundShotID),
		"hit":new htmlSound(consts.soundHitID),
		"buffed":new htmlSound(consts.soundBuffedID)
	};
	htmlEle.sound.bossAtk={};
		for(var x=0;x<7;x++) htmlEle.sound.bossAtk[x]=new htmlSound(consts.soundBossAtkID+x);
		htmlEle.sound.bossAtk['T']=new htmlSound(consts.soundBossAtkID+'T');
	htmlEle.sound.ende={
		"win":new htmlSound(consts.soundEndID+"-win"),
		"lose":new htmlSound(consts.soundEndID+"-lose")
	};
htmlEle.fullScreenMsg={};
htmlEle.fullScreenMsg.rankView=ge(consts.rankView);
htmlEle.fullScreenMsg.rankSubmit=ge(consts.rankSubmit);
htmlEle.fullScreenMsg.help=ge(consts.msgPregame);
htmlEle.fullScreenMsg.restart=ge(consts.restartConfirmPage);
htmlEle.rankSubmit={};
	htmlEle.rankSubmit.parent=ge(consts.rankSubmit);
	htmlEle.rankSubmit.input_id=ge(consts.rankSubmit+'-id');
	htmlEle.rankSubmit.input_time=ge(consts.rankSubmit+'-time');
	htmlEle.rankSubmit.input_php=ge(consts.rankSubmit+'-php');
	htmlEle.rankSubmit.input_bhp=ge(consts.rankSubmit+'-bhp');
	htmlEle.rankSubmit.confirm=ge(consts.rankSubmitConfirm);
htmlEle.rankView={};
	htmlEle.rankView.refreshAll=ge(consts.rankView_refreshAll);
	htmlEle.rankView.content=ge(consts.rankView_content);
	htmlEle.rankView.dataHp=ge(consts.rankView_data_hp);
	htmlEle.rankView.dataTime=ge(consts.rankView_data_time);
//   game consts
{
	// set bg range
	htmlEle.playViewBg.in.style.left=(consts.minX)+"px";
	htmlEle.playViewBg.in.style.width=(consts.maxX-consts.minX)+"px";
	htmlEle.playViewBg.in.style.top=(consts.minY)+"px";
	htmlEle.playViewBg.in.style.height=(consts.maxY-consts.minY)+"px";
}
var imgSet=[
newIP(consts.player0imgID,'test-yous-eng.png'),
newIP(consts.bossImgID,'test-bosses.png'),
newIP('img-bullet','test-arrow.png'),
newIP('img-arrow-up','arrow-up_b.png'),
newIP('img-atk','atk.png'),
newIP('img-timer','timer.png'),
newIP('img-end-win','end-won.png'),
newIP('img-end-lose','end-died.png'),
newIP('img-mute','mute.png'),
newIP('img-trace','trace.png'),
];for(var x=0;x<imgSet.length;x++) imgSet[x].path=consts.imgDir+imgSet[x].path;
var imgID2It=[]; for(var x=0;x<imgSet.length;x++) imgID2It[imgSet[x].id]=x;
function imgload(){imgloaded[imgID2It[this.id]]=1;}
//  control
var kbdef=new kbObj();
var touchBtns=[
newTB('touch-ctl-left','img-arrow-up',-90,kbdef.left),
newTB('touch-ctl-down','img-arrow-up',180,kbdef.down),
newTB('touch-ctl-up','img-arrow-up',0,kbdef.up),
newTB('touch-ctl-right','img-arrow-up',90,kbdef.right),
newTB('touch-ctl-atk','img-atk',0,kbdef.atk),
newTB(consts.touchPauseID,'img-timer',0,kbdef.pause),
newTB(consts.touchMuteID,'img-mute',0,kbdef.mute),
];
var touchBtnID2kb=[]; for(var x=0;x<touchBtns.length;x++) touchBtnID2kb[touchBtns[x].id]=touchBtns[x].kb;
function touchStrt(){keystat[touchBtnID2kb[this.id]]=1;this.style.opacity="0.75";}
function touchEnd(){keystat[touchBtnID2kb[this.id]]=0;this.style.opacity="0.25";}

// variables

var nomsg=0;
var loadingClk=0;
var clk=0;
var pause=1;
var muted=1;
var nextFrame=0;

var keystat_pre={length:512}; for(var x=0;x<512;x++) keystat_pre[x]=0;
var keystat={length:512}; for(var x=0;x<512;x++) keystat[x]=0;
var imgloaded=[]; for(var x=0;x<imgSet.length;x++) imgloaded[x]=0;

var view_ldur={};
view_ldur.objDispWd={};
view_ldur.objDispWd.XY={}; view_ldur.objDispWd.XY.length=2;
view_ldur.objDispWd.WH={}; view_ldur.objDispWd.WH.length=2;
view_ldur.htmlView=htmlEle.playView;
view_ldur.move=function(){
	this.innerDxy={};
		this.innerDxy[0]=Number(this.htmlView.in.style.left.slice(0,-2));
		this.innerDxy[1]=Number(this.htmlView.in.style.top.slice(0,-2));
		//this.innerDxy.length=2;
	this.l=-this.cw_half-this.innerDxy[0];
	this.r= this.cw_half-this.innerDxy[0];
	this.u=this.ch-this.innerDxy[1];
	this.d=0-this.innerDxy[1];
	//this.objDispWd.XY=[-this.innerDxy[0], -this.innerDxy[1]];
	this.objDispWd.XY[0]=-this.innerDxy[0];
	this.objDispWd.XY[1]=-this.innerDxy[1]+this.ch/2;
};
view_ldur.resize_partial=function(){
	this.cw=this.htmlView.out.clientWidth;
	this.ch=this.htmlView.out.clientHeight;
	this.cw_half=this.cw/2;
	//this.objDispWd.WH=[ this.cw*1.25+256,  this.ch*1.25+256];
	this.objDispWd.WH[0]=this.cw+1024;
	this.objDispWd.WH[1]=this.ch+1024;
};
view_ldur.update=function(resized){
	if(resized) this.resize_partial();
	this.move();
};view_ldur.update(1);
view_ldur.isOutOfRange=function(XY){return outOfRange(XY,minArr.new(this.l,this.d),minArr.new(this.r,this.u));};
view_ldur.inRangeMove=function(obj,dXY){obj.moveObj(dXY,minArr.new(this.l,this.d),minArr.new(this.r,this.u));};

//var refreshQ=[];
var msgQ={};
msgQ.boss=new classMsgQ('boss',5,99,htmlEle.msg.boss);
msgQ.sk=new classMsgQ('sk',5,99,htmlEle.msg.skill);
msgQ.oth=new classMsgQ('oth',5,99,htmlEle.msg.oth);
msgQ.sys=new classMsgQ('sys',5,99,htmlEle.msg.sys);

