//lwacht: double checking required docs
try {
	var eText = "";
	docsMissing = false;
	showList = true;
	addConditions = false;
	addTableRows = false;
	var tblRow = [];
	var conditionTable = [];
	r = getReqdDocs("Application", "AV");
	logDebug("capIDString: " + typeof(capIDString));
	//if("undefined".equals(typeof(capIDString))){
	if("".equals(capIDString)){
		vSubmittedDocList = aa.env.getValue("DocumentModelList");
		submittedDocList = vSubmittedDocList.toArray();
		eText+=" using aa.env.getValue" + br;
		logDebug(" using aa.env.getValue");
	}else{
		//capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		submittedDocList = aa.document.getDocumentListByEntity(capIDString,"TMP_CAP").getOutput().toArray();
		eText+=" using getDocumentListByEntity" + br;
	}
	uploadedDocs = new Array();
	dr = "";
	eText+=("submittedDocList: " + submittedDocList.length) + br;
	//logDebug("submittedDocList: " + submittedDocList.length());
	//getValue isn't working but do not need this the first time around, so hack.
	var docsSubmitted = false;
	for (var i in submittedDocList ){
		uploadedDocs[submittedDocList[i].getDocCategory()] = true;
		eText+=("uploaded doc: " + submittedDocList[i].getDocCategory()) + br;
		docsSubmitted =true;
	}
	eText+=("r.length: " + r.length) + br;
	if (r.length > 0 && showList) {
		for (x in r) {
			eText+=(" required doc: " + r[x].document) + br;
			eText+=(" uploaded doc: " +uploadedDocs[r[x].document]) + br;
			if(uploadedDocs[r[x].document] == undefined) {
				showMessage = true; 
				if (!docsMissing)  {
					comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required based on the information you have provided: </span><ol>"); 	
					docsMissing = true; 
					showList = true;
				}
				conditionType = "License Required Documents";
				dr = r[x].condition;
				publicDisplayCond = null;
				if (dr) {
					ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
					for(var i = 0;i<ccr.length;
					i++) if(ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase()) publicDisplayCond = ccr[i];
				}
				if (dr && ccr.length > 0 && showList && publicDisplayCond) {
					message += "<li><span>" + dr + "</span>: " + publicDisplayCond.getPublicDisplayMessage() + "</li>";
				}
				if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType,null,dr,null)) {
					addStdCondition(conditionType,dr);
				}
				if (dr && ccr.length > 0 && addTableRows) {
					tblRow["Document Type"] = new asiTableValObj("Document Type",""+dr, "Y"); 
					tblRow["Document Description"]= new asiTableValObj("Document Description",""+lookup("LIC_CC_DOCUMENTS", dr), "Y"); 
					tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
					tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y"); ; 
					conditionTable.push(tblRow);
				}	
			}	
		}
		if (dr && ccr.length > 0 && addTableRows) {
			removeASITable("ATTACHMENTS"); 
			asit = cap.getAppSpecificTableGroupModel();
			addASITable4ACAPageFlow(asit,"ATTACHMENTS",conditionTable);
		}
	}
	aa.sendMail(sysFromEmail,debugEmail, "", "INFO ONLY: ASB:Licenses/Cultivation/*/Application: Doc check: " + startDate, "capId: " + capId + ": " + eText);
	logDebug("eText: " + eText);

	if (r.length > 0 && showList && docsMissing && docsSubmitted && publicUser)  {
		cancel = true;
		showMessage = true;
		comment("</ol></div>");
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Application: Doc check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/*/Application: Doc check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}
