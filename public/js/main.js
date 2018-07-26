window.$ = window.jQuery = require('jquery');
window.jsrender = require('jsrender');
// console.log($.views);
require('./imports');

//* Basic Functions 
function toggleModal() {
  var modal = $('#modal');
  toggle(modal);
}

function showContent(content) {
  var content = $('.content-body .' + content);
  show(content);
}


function showMainContent() {
  var mainContent = $('.content-body.list');
  switchButtons(true);
  show(mainContent);
}

function switchButtons(def) {
  // TODO TEST
  /** Default Returns to original states */
  if (def) {
    show($('#account-show'));
    hide($('#account-hide'));
  } else {
    toggle($('#account-show'));
    toggle($('#account-hide'));
  }
}

function hideAll(showMain) {
  var content = $('.content-body');
  var modal = $('#modal');

  content.each(function (i) {
    //? Vanilla JS because $ isn't in scope
    if (!this.classList.contains('hidden'))
      this.classList.add('hidden')
  })

  hide(modal);
  if (showMain)
    showMainContent();
}

function objectHasId(id) {
  if (id == "account-show") {
    hideAll();
    switchButtons();
    target = $('.content-body.account')
    show(target)
  } else if (id == "account-hide") {
    hideAll(true);
    switchButtons(true);
  } else {
    // TODO CATCH ALL
  }
}

function objectHasNoId(classList) {
  if (classList.contains("account-show")) {

  }
}

function show(object) {
  if (object.hasClass('hidden'))
    object.removeClass('hidden');
}

function hide(object) {
  if (!object.hasClass('hidden'))
    object.addClass('hidden');
}

function toggle(object) {
  if (object.hasClass('hidden'))
    object.removeClass('hidden');
  else
    object.addClass('hidden')
}

//* JS Render Functions
window.renderTemplate = function renderTemplate(template, data, el) {
  //!remove when complete
  $(el).html(template.render(data));
}

window.renderMultiple = function renderMultiple(template, data, el) {
  //!remove when complete
  var html = "";
  data.forEach(function (item, i) {
    html += template[i].render(data[i])
  })
  $(el).html(html);
}

//? Redundant, but keep anyway
function renderTemplateFromFile(path, el, data) {
  var html = jsrender.renderFile(path, data);
  $(el).html(html);
}

//* Body Events
$(document).on('click', function (e) {
  // console.log($(this));
  // console.log(e);
  var target = e.target;

  if (target.id) {
    objectHasId(target.id);
  } else {
    objectHasNoId(target.classList);
  }
})

//* Button Events
$('#account-show').click((e) => {
  hideAll();
  account = $('.content-body.account')
  show(account);
})

$('#account-hide').on('click', (e) => {
  hideAll();
})



//* Load Linked Content
//! Giving up on templates until I at least have the basics of the app down
// require('./imports'); 

//* Load Main Content
$(document).ready((e) => {
  showMainContent();
})