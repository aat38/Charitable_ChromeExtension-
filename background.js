// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         if (request.msg === "retrieved_NPO") {
//             //  To do something
//              console.log(request.data.content)
//         }
//     }
// );

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//     var myTabId = tabs[0].id;
//     chrome.tabs.sendMessage(myTabId, {text: "hi"}, function(response) {
//         alert(response);
//     });
// });

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log("background.js got a message")
//         console.log(request);
//         console.log(sender);
//         sendResponse("bar");
//     }
// );