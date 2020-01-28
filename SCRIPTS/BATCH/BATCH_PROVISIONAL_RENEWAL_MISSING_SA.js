/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PROVISIONAL_RENEWAL_MISSING_SA.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 03/05/2013 - Jaime Shear
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
showDebug = false;	
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0


eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName) {
vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;


batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var appGroup = getParam("recordGroup");							//   app Group to process {Licenses}
var appTypeType = getParam("recordType");						//   app type to process {Rental License}
var appSubtype = getParam("recordSubtype");						//   app subtype to process {NA}
var appCategory = getParam("recordCategory");						//   app category to process {NA}
var skipAppStatusArray = getParam("skipAppStatus").split(",");	//   Skip records with one of these application statuses
var condType = getParam("condType");							// records with Condition Type applied
var emailAddress = getParam("emailAddress");					// email to send report
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");// send out emails?
var emailTemplate = getParam("emailTemplate");					// email Template


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;
var useAppSpecificGroupName = false;


var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));


var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


if (appGroup == "*")
	appGroup = "";

if (appTypeType == "*")
	appTypeType = "";

if (appSubtype == "*")
	appSubtype = "";

if (appCategory == "*")
	appCategory = "";

//logDebug("Historical Date Check: " + dateCheck);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
logDebug("********************************");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess(){

try{	
	var capFilterStatus = 0;
	var capCount  =0;
	
	var capModel = aa.cap.getCapModel().getOutput();
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup(appGroup);
	capTypeModel.setType(appTypeType);
	capTypeModel.setSubType(appSubtype);
	capTypeModel.setCategory(appCategory);
	capModel.setCapType(capTypeModel);
	
	var typeResult = aa.cap.getCapIDListByCapModel(capModel);
	if (typeResult.getSuccess())
	{
		vCapList = typeResult.getOutput();
	}
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage());
	}


	for (x in vCapList) {
		
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var capValue = aa.cap.getCap(capId).getOutput();
		var altID = capId.getCustomID();
		var capStatus = aa.cap.getCap(capId).getOutput().getCapStatus();
		
		// Filter by CAP Status
		if (exists(capStatus, skipAppStatusArray)) {
			capFilterStatus++;
			continue;
		}
		
		if (capValue.isCompleteCap() && getAppSpecific("License Issued Type",capId) == "Provisional"){
			var condResult = aa.capCondition.getCapConditions(capId);
			if (condResult.getSuccess()){
				var capConds = condResult.getOutput();
				for (cc in capConds){
					var thisCond = capConds[cc];
					var cStatusType = thisCond.getConditionStatusType();
					if (thisCond.getConditionDescription().equals(condType) && cStatusType == "Applied"){
						capCount++;
						vLicenseID = getParent(capId);
						var licCaseId = createChild("Licenses","Cultivator","License Case","NA","",vLicenseID);
						if(matches(licCaseId, null, "", undefined)){
							amendNbr = amendNbr = "000" + 1;
						}else{
							var cIdLen = licCaseId.length
							if(licCaseId.length <= 9){
								amendNbr = "000" +  cIdLen;
							}else{
								if(licCaseId.length <= 99){
									amendNbr = "00" +  cIdLen;
								}else{
									if(licCaseId.length <= 999){
										amendNbr = "00" +  cIdLen;
									}else{
										amendNbr = cIdLen
									}
								}
							}
						}
						altId = capId.getCustomID();
						yy = altId.substring(0,2);
						newAltId = vLicenseID.getCustomID() + "-LC"+ yy + "-" + amendNbr;
						if (licCaseId){
							logDebug("Created License Case: " + newAltId);
						}
						removeCapCondition(thisCond.getConditionType(),thisCond.getConditionDescription(),cStatusType,capId);
					}
				}
			}
		}
	}
	
	logDebug("Ignored due to CAP Status: " + capFilterStatus);
	logDebug("Total CAPS processed: " + capCount);
}catch (err){
	logDebug("BATCH_PROVISIONAL_RENEWAL_MISSING_SA: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}