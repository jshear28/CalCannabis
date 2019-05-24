try {
	if(wfStatus == "Amendment Approved") {
		var drpEmail = AInfo["DRP Email Address"];
		drpEmail = drpEmail.toUpperCase();
		var drpNewEmail = AInfo["DRP Email Address"];
		drpNewEmail = drpNewEmail.toUpperCase();
		if(AInfo["Change DRP"] == "Yes") {
			var licContactResult = aa.people.getCapContactByCapID(parentCapId);
			if (licContactResult.getSuccess()){
				var licContacts = licContactResult.getOutput();
				licFnd = false;
				for (i in licContacts){
					if(licContacts[i].getCapContactModel().getEndDate() != null)
						continue;
						var licEmail = licContacts[i].getCapContactModel().getEmail();
						licEmail = licEmail.toUpperCase();
						logDebug("emails " + licEmail + " " + drpEmail);
					if(licContacts[i].getCapContactModel().getContactType() == "Designated Responsible Party" && licEmail == drpEmail) {
						var licCont = licContacts[i].getCapContactModel();
						var endDate = new Date();
						licCont.setEndDate(endDate);
						var peopleModel = licCont.getPeople();
						aa.people.editCapContactWithAttribute(licCont);
						logDebug("DRP " + licCont.email + " Deactivated");
						if(AInfo["Remove DRP as Owner"] == "Yes") {
							amendOwners = loadASITable("OWNERS",parentCapId);
							for(a in amendOwners) {
								var ownEmail = ""+amendOwners[a]["Email Address"];
								ownEmail = ownEmail.toUpperCase();
								logDebug("emails " + ownEmail + " " + drpEmail);
								if(ownEmail == drpEmail)
									amendOwners[a]["Change Status"] = "Delete";
									logDebug("status " + amendOwners[a]["Change Status"]);
							}
							removeASITable("OWNERS",parentCapId);
							addASITable("OWNERS",amendOwners,parentCapId);
						}	
					}
				}
			}
			copyContactsByType_rev(capId,parentCapId,"Designated Responsible Party",AInfo["New DRP Email Address"]);
		}
//  Send approval email notification to current DRP
		var licContactResult = aa.people.getCapContactByCapID(capId);
		if (licContactResult.getSuccess()){
		var licContacts = licContactResult.getOutput();
		licFnd = false;
		for (i in licContacts){
			if(AInfo["Change DRP"] == "Yes") {
				if(licContacts[i].getCapContactModel().getContactType() == "Designated Responsible Party" && licContacts[i].getCapContactModel().getEmail().toUpperCase() == drpEmail) {
					var drpEmail = AInfo["DRP Email Address"];
					var drpFirst = AInfo["New DRP First Name"];
					var drpLast = AInfo["New DRP Last Name"];
					var drpChannel = licContacts[i].getCapContactModel().getPreferredChannel();
					licFnd = true;
					break;
				}
			}
			else {
				if(licContacts[i].getCapContactModel().getContactType() == "Designated Responsible Party" && licContacts[i].getCapContactModel().getEmail().toUpperCase() == drpNewEmail) {
					var drpEmail = AInfo["New DRP Email Address"];
					var drpFirst = AInfo["New DRP First Name"];
					var drpLast = AInfo["New DRP Last Name"];
					var drpChannel = licContacts[i].getCapContactModel().getPreferredChannel();
					licFnd = true;
					break;
				}
			}
		}
		if(licFnd)
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactFirstName$$", drpFirst);
			addParameter(eParams, "$$contactLastName$$", drpLast);
			addParameter(eParams, "$$contactEmail$$", drpEmail);
			addParameter(eParams, "$$parentId$$", parentCapId);
			var priEmail = ""+drpEmail;
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_APPROVAL",eParams, rFiles,capId);
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",drpChannel);
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Amendment Approval","Amendment Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,parentCapId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	}
	if(wfStatus == "Amendment Rejected") {
//  Send rejected email notification to DRP
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var contPhone = priContact.capContact.phone1;
			if(contPhone){
				var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
			}else{
				var fmtPhone = "";
			}
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", parentCapId);
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_REJECTED",eParams, rFiles,capId);
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Amendment Approval","Amendment Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,parentCapId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/DRP DECLARATION: Amendmeth Approved/Rejected " + err.message);
	logDebug(err.stack);
}