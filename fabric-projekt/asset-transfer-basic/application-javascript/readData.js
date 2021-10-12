/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const { buildCCPOrg1,buildCCPOrg2, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';


const isExisted = require('./checkExistence.js');


//const buildWallet = require('../../test-application/javascript/AppUtil.js');

var  buildCCPOrg;

var mspOrg = '';

var walletname = '';

var caname = '';

var orgname = '';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

module.exports.read =  async function(id, laborname,firstname,lastname,birthDate,location){
	
	try {
		
		if (laborname == 'gesundheitsamt') {


			if (isExisted.check("admin", 'gesundheitsamtwallet')) {

				mspOrg = 'Org1MSP';
				walletname = 'gesundheitsamtwallet';
				caname = 'ca.org1.example.com';
				orgname = 'org1.department1';

				readData(laborname, mspOrg, walletname, caname, orgname, "admin", id, laborname,firstname,lastname,birthDate,location);

			}
			
		}
		
		if (laborname == 'testlabor1') {


			if (isExisted.check("admin", 'testlabor1Wallet')) {

				mspOrg = 'Org2MSP';
				walletname = 'testLabor1Wallet';
				caname = 'ca.org2.example.com';
				orgname = 'org2.department1';

				readData(laborname, mspOrg, walletname, caname, orgname, "admin", id, laborname,firstname,lastname,birthDate,location);


			}
			
		}
		
		
		
		if (laborname == 'testlabor2') {

			if (isExisted.check("admin", 'testLabor2Wallet')) {

				mspOrg = 'Org2MSP';
				walletname = 'testlabor2Wallet';
				caname = 'ca.org2.example.com';
				orgname = 'org2.department1';

				readData(laborname, mspOrg, walletname, caname, orgname, "admin", id, laborname,firstname,lastname,birthDate,location);

			}

		} 

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
	
};	
	
	
	
async function readData(testlabor, mspOrg, walletname, caname, orgname, orgUserId, id,laborname,firstname,lastname,birthDate,location){
	
	mspOrg = mspOrg;
	walletname = walletname;
	caname = caname;
	orgname = orgname;
	var ccp;
	console.log("Helllllllllllllo");
	console.log(caname);


	if (testlabor == "gesundheitsamt") {

		ccp = buildCCPOrg1();
	}

	if (testlabor == "testlabor1" || testlabor == "testlabor2") {

		ccp = buildCCPOrg2();

	}

	try {

		const walletPath = path.join(__dirname, walletname);

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, caname);

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);


		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();



		// setup the gateway instance
		// The user will now be able to create connections to the fabric network and be able to
		// submit transactions and query. All transactions submitted by this gateway will be
		// signed by this user using the credentials stored in the wallet.
		await gateway.connect(ccp, {
			wallet,
			identity: orgUserId,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});


		// Build a network instance based on the channel where the smart contract is deployed
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(chaincodeName);

		// Now let's try to submit a transaction. id, laborname, firstname, lastname, birthdate,code,location,dateandtime,result
		// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
		// to the orderer to be committed by each of the peer's to the channel ledger.
		console.log('\n--> Evaluate Transaction: ReadAsset');
		var result = await contract.evaluateTransaction('ReadAsset', id);
		
		var resultexract = JSON.parse(result.toString());
	    
		if(resultexract.firstName != firstname){
			
			console.log("The first name you entered is not right.. please enter anoher one !");
			return;
			
		}
		
		if(resultexract.lastName != lastname){
			
			console.log("The last name you entered is not right.. please enter anoher one !");
			return;
		}
		
		if(resultexract.birhdate != birthDate){
			
		    console.log("The birth date you entered is not right.. please enter anoher one !");
			return;
		}
		
		if(resultexract.Laborlocaion != location){
			
		    console.log("The location you entered is not right.. please enter anoher one !");
			return;
		}
		
		
		
		
		
		
		console.log(`*** The test result is : ${resultexract.testResult}`)
		//console.log(`*** Result: ${prettyJSONString(result.toString())}`);
	

        gateway.disconnect();

		
	} catch (error) {
		console.log("The id you entered is not right , please enter another one !")
	    //console.error(`******** FAILED to run the application: ${error}`);
	}

	
	
	
}
