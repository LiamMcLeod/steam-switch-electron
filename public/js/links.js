//* Dynamically Create Links
var link = document.createElement('link');
link.rel = 'import';
link.href = 'account.html';

//link.setAttribute('async', ''); 
//? Maybe look into this?

link.onload = function(e) {
    var parentDoc = document.currentScript.ownerDocument;
    var el = parentDoc.querySelector('#account')
    var container = document.body.querySelector('main');

    var hideButton = document.body.querySelector('#hide-button');
    console.log(document.body);

    hideButton.addEventListener('click', (e) => {
        console.log("Event Fired")
    })
};
link.onerror = function(e) {
    console.log(e)
};
document.head.appendChild(link);