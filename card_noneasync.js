
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

function near(datestr){
	var datearr=datestr.split("-");
	//console.log(datearr);
	var expiredate=new Date();
	expiredate.setFullYear(datearr[0],parseInt(datearr[1])-1,datearr[2]);//expiredate.setFullYear('2018',9,'30');
	var now=new Date();
	// console.log(now);
	//console.log(expiredate);
	// console.log(now-expiredate);
	isexpireornear=false;
	if(now.getFullYear()-expiredate.getFullYear()>0){
		isexpireornear=true;
	}else if(now.getFullYear()-expiredate.getFullYear()==0){
		if(now.getMonth()-expiredate.getMonth()>0){
			isexpireornear=true;
		}else if(now.getMonth()-expiredate.getMonth()==0){
			if(expiredate.getDay()-now.getDay()<14){
				isexpireornear=true;
			}
		}
	}
	//console.log(isexpireornear);
	return isexpireornear;
}
function postReq(){
	
	request.post(urls['cardcount'],{json : getSenddata('cardcount',"",""),
	},function(error0,response0,body0){
		console.log("---body0---");
		console.log(body0);
		// console.log(body['cardCount']);
		// resolveBody(body0);
		var cardlist={};
		for(var i=0;i<body0['cardCount']-1070;i+=4){
			console.log(i);
			request.post(urls['cardiccid'],{json :getSenddata('cardiccid',i,i+3)
			
			},function(error1,response1,body1){
				console.log("===body1===");
				//console.log(body1);	
				console.log(body1['cardCount']);	
				var expire_iccids=[];
				var outofdata_iccids=[];
				for(var j=0;j<body1['cardCount'];j+=1){
					var card=body1['cardList'][j];
					expire_iccids.push({'iccid':card['iccid']});
					if (near(card['expirationTime'])){
						//expire_iccids.push({'iccid':card['iccid']});
					}
					if (card['totaldata']-card['outdata']<=2){
						outofdata_iccids.push({'iccid':card['iccid'],'operator':card['operator']});
					}
				}
				console.log("===expire_iccids===");		
				console.log(expire_iccids.length);
				console.log(expire_iccids);
				LogFile.info(expire_iccids);
				console.log("===outofdata_iccids===");
				console.log(outofdata_iccids);
				//LogFile.info(outofdata_iccids);
				
				
				var card;
				if (outofdata_iccids.length>0){
					for(var j=0;j<outofdata_iccids.length;j+=1){
						console.log(outofdata_iccids[j]);
						card=outofdata_iccids[j];
						console.log(card);
						request.post(urls['availpackagelist'],{json :getSenddata('availpackagelist',outofdata_iccids[j]['operator'],"")
						},function(error2,response2,body2){	
							console.log("******body2*******");
							//console.log(body2);
							console.log(card);
							
							// if(body2['package'].length>0){
								// var packcode=body2['package'][0]['packageCode'];
								// var iccid=outofdata_iccids[j]['iccid'];
								// request.post(urls['isvalidpackage'],{json :getSenddata('isvalidpackage',outofdata_iccids[j]['iccid'],body2['package'][j]['packageCode'])
								// },function(error5,response5,body5){
									// console.log(body5);
									// if(body5['code']==0){
										// request.post(urls['packageorder'],{json :getSenddata('packageorder',packcode,"")
										// },function(error3,response3,body3){	
										// })
									// }
								// })
							// }
						})		
					}
				}
				if (expire_iccids.length>0){	
					// var iccids=[];
					// for(var j=0;j<expire_iccids.length;j+=1){
						// iccids[j]=expire_iccids[j]['iccid'];
					// }
					// request.post(urls['cardpackcode'],{json :getSenddata('cardpackcode',iccids,"")
					// },function(error4,response4,body4){
						// if(body4['cardList'].length>0){
							// for(var j=0;j<body4['cardList'].length;j+=1){
								// expire_iccids[j]['packageCode']=body4['cardList'][j]['packageCode'];
								// request.post(urls['isvalidpackage'],{json :getSenddata('isvalidpackage',body4['cardList'][j]['iccid'],body4['cardList'][j]['packageCode'])
								// },function(error5,response5,body5){
									// if(body5['code']==0){
									// }
								// })
							// }
						// }
					// })		
				}
			})
		}
	})

	
	console.log("+++++++");
	console.log(data);
}

//console.log(urls['cardcount']);
postReq('');
//console.log(near('2018-11-30'));
// postReq('cardiccid');
//getSign(getSenddata());


	// request({
			// url:urls['cardcount'],
			// method:"POST",
			// json: true,
			// headers:{
				// "content-type":"application/json",
			// },
			// body: getSenddata('cardcount'),
	// },function(error0,response0,body0){
		// console.log("------");
		// console.log(body0);
	// })