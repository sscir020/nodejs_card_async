
var log4js = require("log4js");
log4js.configure({
  appenders: {
    cheeseLogs: { type: 'dateFile', filename: './logs/', alwaysIncludePattern: true, pattern: '-yyyy-MM-dd-hh.log', category: 'normal' },
    console: { type: 'console' }
  },
  categories: {
    cheese: { appenders: ['cheeseLogs'], level: 'error' },
    another: { appenders: ['console'], level: 'trace' },
    default: { appenders: ['console', 'cheeseLogs'], level: 'trace' }
  }
})
var LogFile = log4js.getLogger('normal');
var async =require('async');

var request=require('request');
var md5=require('./md5.js');
var urls={ 
	'cardcount':'http://api.cmpyun.com/api/serviceAccept/getAllCardCount',
	'cardiccid':'http://api.cmpyun.com/api/serviceAccept/getCardList',
	'cardpackcode':'http://api.cmpyun.com/api/serviceAccept/findCardInfoList',
	'availmainpackagelist':'http://api.cmpyun.com/api/serviceAccept/getMainPackageList',
	'isvalidpackage':'http://api.cmpyun.com/api/serviceAccept/checkRecharge',
	'mainpageckorder':'http://api.cmpyun.com/api/serviceAccept/orderMainFlow',
	'availpackagelist':'http://api.cmpyun.com/api/serviceAccept/getPackageList',
	'packageorder':'http://api.cmpyun.com/api/serviceAccept/orderFlow',
}
var appid='LYWLxK9ecfDllidm3nih';
var dt='1539593700';
var secret='EqyhIReOOBS3gUFIUw4dJUg1XWAoZRqI';
var appSecrect='5Ktul9tEP2';
function getSign(senddata){
	var arr=[];//new Array();//senddata.keys().length+1// var arr=new Array(4+n);// arr[0]='&appid='+appid;// arr[1]='&dt='+dt;// arr[2]='&secret='+secret;
	var i=0;
	for(key in senddata){
		arr[i]="&"+key+"="+senddata[key];
		i+=1;
	}
	// console.log(arr);
	var arr1=arr.sort();
	arr1[arr.length]='&appSecret='+appSecrect;
	str=arr1.toString().replace(/,/g,"").substring(1);
	md5str=md5.hex_md5(str).toUpperCase();
	//console.log("["+str+"]");
	//console.log(md5str);
	return md5str;
}
function getSenddata(type,param1,param2){
	var senddata={
		'appid':appid,
		'dt':dt,
		'secret':secret,	
	}

	if(type=='isvalidpackage'){
		senddata['iccid']=param1;
		senddata['packageInfo']=param2;
	}	
		
	senddata['sign']=getSign(senddata);
	
	if(type=='cardiccid'){
		senddata['cardStart']=param1;
		senddata['cardEnd']=param2;
	}else if(type=='availpackagelist'){
		senddata['operator']=param1;
		senddata['platform']='1';
	}
	// console.log(senddata);
	return senddata;
}
var data;



function postReq(){
	outofdata_iccids=[  { iccid: '8986031644202756228', operator: 3 },
						{ iccid: '8986031644202756433', operator: 3 },
						{ iccid: '898602B8231770237437', operator: 1 } ];	

	console.log("===outofdata_iccids===");
	console.log(outofdata_iccids);
	//LogFile.info(outofdata_iccids);
				

	// var card;

	// for(var j=0;j<outofdata_iccids.length;j+=1){
		// card=outofdata_iccids[j];
		// console.log("-------"+j+"--------");
		// console.log(card);
		// request.post(urls['availpackagelist'],{json :getSenddata('availpackagelist',outofdata_iccids[j]['operator'],"")
		// },function(error2,response2,body2){	
			// console.log("******body2*******");
			// console.log(body2);
			// console.log(card);
			

		// })		
	// }
	var index=0;
	async.mapSeries(outofdata_iccids,function(acard,callback){
			//card=outofdata_iccids[index];
			console.log("-------"+index+"--------");
			console.log(acard);
			request.post(urls['availpackagelist'],{json :getSenddata('availpackagelist',outofdata_iccids[index]['operator'],"")
			},function(error2,response2,body2){	
				console.log("******body2*******");
				console.log(body2['package'].length);
				//console.log(index);
				console.log(acard);
				callback(null,index);
			})
			index+=1;
			
		},function(err,results){
			console.log("-------"+err+"--------");
			console.log("-------"+results+"--------");
		}
	);
	// var index=0;
	// process.nextTick(function next(){
		// card=outofdata_iccids[index];
		// console.log("-------"+index+"--------");
		// console.log(card);
		// request.post(urls['availpackagelist'],{json :getSenddata('availpackagelist',outofdata_iccids[index]['operator'],"")
		// },function(error2,response2,body2){	
			// console.log("******body2*******");
			// console.log(body2);
			// console.log(card);
		// })
		// index+=1;
		// if(index>=outofdata_iccids.length){
			// console.log("done");
		// }else{
			// process.nextTick(next);
		// }			
	// });

	
	console.log("+++++++");
	console.log(data);
}

//console.log(urls['cardcount']);
postReq('');