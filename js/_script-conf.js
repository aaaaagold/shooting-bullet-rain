
"use strict";

// constants
var consts={};
//  rankServer
consts.rankServer="localhost:8080";
//  id
consts.playViewOuter='playground';
consts.playViewInner='playground-inner';
consts.playViewBgInner='playground-bg-inner';
consts.playMsgPause='play-msg-pause';
consts.playMsgStart='play-msg-start';
consts.msgTopID='play-msgs-top';
consts.msgBossID='play-msg-boss';
consts.msgMidID='play-msgs-mid';
consts.msgSkID='play-msg-skill';
consts.msgBtmID='play-msgs-btm';
consts.msgOthID='play-msg-oth';
consts.msgSysID='play-msg-system';
consts.endblk='ende';
consts.endWin='end-win';
consts.endLose='end-lose';
//  id-menu
consts.btnRestart='menu-restart';
consts.menuReadme='menu-readme';
consts.menuRankView='menu-ranks';
consts.menuRankSubmit='menu-submit';
//  id-menu-function
consts.menuPause='menu-pause';
consts.menuMute='menu-mute';
consts.menuAutoShot='menu-auto-shot';
consts.menuAutoMove='menu-auto-move';
//  id-blk
consts.bossID='boss';
consts.bulletID='bullet-player';
consts.bulletPlayerID=consts.bulletID;
consts.bulletBossID='bullet-boss';
consts.playerID='player';
consts.bossPtrID='boss-ptr';
consts.hitEffectID='hit-effect';
consts.dropID='drop';
consts.bossStatID='boss-stat';
consts.playerStatID='player-stat';
consts.touchPauseID='touch-ctl-pause';
consts.touchMuteID='touch-ctl-mute';
consts.timeStatID="time-stat";
//  id-blk-img
consts.player0imgID='img-you';
//const.bossImgIDs=[];
consts.bossImgID='img-boss';
//  id-blk-img-dir-path
consts.imgDir="img/";
//  id-sound
consts.soundShotID='sound-shot';
consts.soundHitID='sound-hit';
consts.soundBuffedID='sound-buffed';
consts.soundBossAtkID='sound-boss-atk';
consts.soundEndID='sound-end';
//  id-fullScreenMsgs
consts.msgPregame='msg-pregame';
consts.restartConfirm='restart-yes';
consts.restartConfirmPage='restart-confirm';
consts.rankView='rankview';
consts.rankView_refreshAll='rankRefresh-all';
consts.rankView_content="rankContent";
consts.rankView_data_time='rankData-byTime';
consts.rankView_data_hp='rankData-byHp';
consts.rankSubmit='ranksubmit';
consts.rankSubmitConfirm='ranksubmit-confirm';
//  game values
consts.updatePeriod=41;
consts.minY=-100;
consts.maxY=999;
consts.minX=-999;
consts.maxX=999;
consts.hideY=-9999;
consts.maxHP=500;
consts.maxMP=99;
consts.maxBossClk=10000;
consts.bulletLife=55;
consts.bulletAtk=1;
consts.initMoveSpeed=20;
consts.maxBullet=Math.max(consts.bulletLife*6,64); // deprecated
consts.maxBulletPlayer=consts.maxBullet; // replace ^ 
consts.maxBossBullet=Math.max(consts.bulletLife*8,64); // deprecated
consts.maxBulletBoss=consts.maxBossBullet; // replace ^ 
consts.maxHitEffect=64;
consts.maxDrop=8;
consts.playerInitXY=[0,0];
consts.bossInitXY=[0,consts.maxY-consts.initMoveSpeed*4];
consts.hideInitXY=[0,consts.hideY];

// functions' conf
// i.e. const functions for rval of '='
// move
var moves={};
moves.readme="assigned 'function's to 'obj.move'";
// move-bullet-function
moves.bullet={};
	moves.bullet.move=function(targetXY){
	};
	moves.bullet.hardTrace=function(targetXY){
		if(this.disappear==1) return;
		if(this.bulletLife<=1){ this.disappear=1; }
		else this.bulletLife-=1;
		var ilen=dist(this.inertia);
		var bbXY=minArr.minus(targetXY,this.XY);
		var bblen=dist(bbXY);
		if(ilen!=0 && bblen!=0){
			//var ilenInv=1/ilen; // 2.2
			var ilenInv=(this.bulletLife)/(ilen*consts.bulletLife); // 2.3
			var bblenInv=1/bblen;
			var totalWeight=ilenInv+bblenInv;
			for(var bi=0;bi<this.inertia.length;bi++)
				this.inertia[bi]=avgvw(this.inertia[bi]*ilenInv,ilenInv,bbXY[bi]*bblenInv,bblenInv);
			var coef=ilen/dist(this.inertia);
			for(var bi=0;bi<this.inertia.length;bi++)
				this.inertia[bi]*=coef;
		}
		this.moveObj(this.inertia);
	};
	moves.bullet.softTrace=function(targetXY){
		if(this.disappear==1) return;
		if(this.bulletLife<=1 || outOfRange(this.XY,[consts.minX,consts.minY],[consts.maxX,consts.maxY])){ this.disappear=1; }
		else this.bulletLife-=1;
		var ilen=dist(this.inertia);
		var bbXY=minArr.minus(targetXY,this.XY);
		var bblen=dist(bbXY);
		if(ilen!=0 && bblen!=0){
			var ilenInv=1/ilen;
			var bblenInv=1/bblen;
			for(var bi=0;bi<this.inertia.length;bi++)
				this.inertia[bi]=avgvw(
					this.inertia[bi]*ilenInv,31,
					bbXY[bi]*bblenInv,this.bulletLife/consts.bulletLife
				);
			var coef=ilen/dist(this.inertia);
			for(var bi=0;bi<this.inertia.length;bi++)
				this.inertia[bi]*=coef;
		}
		this.moveObj(this.inertia,minArr.new(consts.minX*2,consts.minY*2),minArr.new(consts.maxX*2,consts.maxY*2));
	};
	moves.bullet.edgesNoTrace=function(targetXY){
		if(this.disappear==1) return;
		if(this.bulletLife<=1){ this.disappear=1; }
		else this.bulletLife-=1;
		if(this.frameTime==1){
			var dir=this.moveInfo[this.moveStat][1];
			var len=dist(dir);
			var rate=len==0?0:(this.moveSpeed/len);
			for(var x=0;x<this.inertia.length;x++){
				this.inertia[x]=dir[x];
			}
		}
		this.moveObj(this.inertia);
		if(this.frameTime<this.moveInfo[this.moveStat][0]){ this.frameTime+=1; }
		else{
			if(this.moveStat+1>=this.moveInfo.length){ this.move=moves.bullet.softTrace; }
			else{
				this.moveStat+=1;
				this.frameTime=1;
			}
		}
	};
	moves.bullet.edgesTrace=function(targetXY){
		if(this.disappear==1) return;
		if(this.bulletLife<=1 || this.XY[1]<consts.minY){ this.disappear=1; }
		else this.bulletLife-=1;
		var isLast=(this.moveStat>=this.moveInfo.length);
		if(this.frameTime==1 || isLast){
			var dir=isLast?minArr.minus(targetXY,this.XY):this.moveInfo[this.moveStat][1];
			var len=dist(dir);
			var rate=len==0?0:(this.moveSpeed/len);
			for(var x=0;x<this.inertia.length;x++) this.inertia[x]=dir[x]*rate;
		}
		this.moveObj(this.inertia);
		if(isLast){
			this.move=moves.bullet.softTrace;
		}else{
			if(this.frameTime<this.moveInfo[this.moveStat][0]){ this.frameTime+=1; }
			else{
				this.moveStat+=1;
				this.frameTime=1;
			}
		}
	};
// move-bullet-track
moves.bullet.track={};
	moves.bullet.track.type1=minArr.new(
		minArr.new(
			minArr.new(10,minArr.new(  0,  0)),
			minArr.new( 7,minArr.new(-24,  7)),
			minArr.new( 2,minArr.new(  0,  0))
			//,minArr.new(44,minArr.new(  5,-17))
		),
		minArr.new(
			minArr.new( 6,minArr.new(  0,  0)),
			minArr.new( 7,minArr.new(-25,  0)),
			minArr.new( 6,minArr.new(  0,  0))
			//,minArr.new(44,minArr.new(  7,-13))
		),
		minArr.new(
			minArr.new( 2,minArr.new(  0,  0)),
			minArr.new( 7,minArr.new(-20,-15)),
			minArr.new(10,minArr.new(  0,  0))
			//,minArr.new(44,minArr.new(  6,-11))
		),
		minArr.new(
			minArr.new(10,minArr.new(  0,  0)),
			minArr.new( 7,minArr.new( 24,  7)),
			minArr.new( 2,minArr.new(  0,  0))
			//,minArr.new(44,minArr.new( -5,-17))
		),
		minArr.new(
			minArr.new( 6,minArr.new(  0,  0)),
			minArr.new( 7,minArr.new( 25,  0)),
			minArr.new( 6,minArr.new(  0,  0))
			//,minArr.new(44,minArr.new( -7,-13))
		),
		minArr.new(
			minArr.new( 2,minArr.new(  0,  0)),
			minArr.new( 7,minArr.new( 20,-15)),
			minArr.new(10,minArr.new(  0,  0))
			//,minArr.new(44,minArr.new( -6,-11))
		)
	);

