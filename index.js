import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

let call;
let incomingCall;
let callAgent;
let deviceManager;
let tokenCredential;
const userToken = document.getElementById("token-input"); 
const calleeInput = document.getElementById("callee-id-input");
const submitToken = document.getElementById("token-submit");
const callButton = document.getElementById("call-button");
const hangUpButton = document.getElementById("hang-up-button");
const acceptCallButton = document.getElementById('accept-call-button');
const status = document.getElementById("status");
const callStatus = document.getElementById("statusCall");

submitToken.addEventListener("click", async () => {
    console.log("Submit Button Clicked");
    const callClient = new CallClient();
    const userTokenCredential = userToken.value;
    try {
        tokenCredential = new AzureCommunicationTokenCredential(userTokenCredential);
        callAgent = await callClient.createCallAgent(tokenCredential);
        deviceManager = await callClient.getDeviceManager();
        await deviceManager.askDevicePermission({ audio: true });
        callButton.disabled = false;
        submitToken.disabled = true;
        // Listen for an incoming call to accept.
        callAgent.on('incomingCall', async (args) => {
            try {
                incomingCall = args.incomingCall;
                acceptCallButton.disabled = false;
                callButton.disabled = true;
                status.innerHTML = "Incoming Call";
            } catch (error) {
                console.error(error);
            }
        });
        console.log("Token Connected");
        status.innerHTML = "Token Valid";
    } catch (error) {
        window.alert("Please submit a valid token!");
        status.innerHTML = "Token Invalid";
    }
})

callButton.addEventListener("click", () => {
    try {
        const userToCall = calleeInput.value;
        console.log("This is call status " + call.state);
        if (userToCall) {
            call = callAgent.startCall([{ id: userToCall }]);
            console.log("Call Started");
            status.innerHTML = "Call Started";
            hangUpButton.disabled = false;
            callButton.disabled = true;
            callStatus.innerHTML = call.state;
            console.log("This is call status " + call.state);
        } else {
            console.log("User to call is not specified.");
            status.innerHTML = "User to call is not specified.";
        }
    } catch (error) {
        console.log("Start call failed");
        console.error(error);
        status.innerHTML = "Start call failed";
    }
});

hangUpButton.addEventListener("click", () => {
    console.log("This is call status " + call.state);
    // Check if the call object exists and is in a valid state for hangup
    if (call && call.state === 'Connected') {
        // end the current call
        call.hangUp({ forEveryone: true });

        // Update status to indicate call hangup
        status.innerHTML = "Call ended";

        // toggle button states
        hangUpButton.disabled = true;
        callButton.disabled = false;
        submitToken.disabled = false;
        acceptCallButton.disabled = true;
    } else {
        console.log("This is call status " + call.state);
        console.log("Call is not in a valid state for hangup.");
        status.innerHTML = "Call is not in a valid state for hangup.";
    }
});

acceptCallButton.onclick = async () => {
    try {
        call = await incomingCall.accept();
        acceptCallButton.disabled = true;
        hangUpButton.disabled = false;
        console.log("Accept Call Button clicked");
        status.innerHTML = "Call accept successfull";
    } catch (error) {
        console.log("Accept call failed");
        console.error(error);
        status.innerHTML = "Accept call failed";
    }
}