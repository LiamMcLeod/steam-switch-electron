/**
Liam McLeod, 2018.
*/
window.$ = window.jQuery = require('jquery');
window.jsrender = require('jsrender');
// console.log($.views);
require('./imports');

//* Basic Functions 

/**
 * Toggles "About" modal
 */
function toggleModal() {
    var modal = $('#modal');
    toggle(modal);
}

/**
 * @param  content  String  HTML class name
 *
 * Shows a content div by class name
 */
function showContent(content) {
    content = $('.content-body .' + content);
    show(content);
}

/**
 * Shows main content div
 */
function showMainContent() {
    var mainContent = $('.content-body.list');
    switchButtons(true);
    show(mainContent);
}

/**
 * @param  def  boolean  default state boolean
 *
 * Switches buttons based upon whether 
 * account creation div is shown
 */
window.switchButtons = function switchButtons(def = false) {
    if (def) {
        show($('#account-show'));
        hide($('#account-hide'));
    } else {
        toggle($('#account-show'));
        toggle($('#account-hide'));
    }
}

/**
 * @param  showMain  boolean  show main content boolean
 * 
 * Returns all content to original
 * hidden state
 */
window.hideAll = function hideAll(showMain = true) {
    var content = $('.content-body');
    var modal = $('#modal');

    content.each(function() {
        //? Vanilla JS because $ isn't in scope
        if (!this.classList.contains('hidden')) {
            this.classList.add("hidden");
        }
    });

    hide(modal);
    if (showMain) {
        showMainContent();
    }
};

/**
 * @param  id  String  HTML id interacted with
 * 
 * Checks the id of an element being interacted with
 * action is taken based upon those ids
 */
function objectHasId(id) {
    if (id === "account-show") {
        hideAll(false);
        switchButtons();
        var target = $(".content-body.account");
        show(target);
    } else if (id === "account-hide") {
        hideAll();
        switchButtons(true);
    } else {
        // TODO CATCH ALL
    }
}

//? Can't remember not used I don't think
function objectHasNoId(classList) {
    if (classList.contains("account-show")) {

    }
}

/**
 * @param  el  Object  element to show
 * 
 * shows the provided object
 * provided it has the class hidden
 */
window.show = function show(el) {
    if (el.hasClass('hidden')) {
        el.removeClass('hidden');
    }
}

/**
 * @param  el  Object  element to hide
 * 
 * hides the provided object
 */
function hide(el) {
    if (!el.hasClass('hidden')) {
        el.addClass('hidden');
    }
}

/**
 * @param   el  Object  element to change class
 * 
 * Toggles the hidden status
 * of the provided object
 * using hidden class
 */
function toggle(el) {
    if (el.hasClass('hidden')) {
        el.removeClass('hidden');
    } else {
        el.addClass("hidden");
    }
}

//* JS Render Functions
/**
 * @param   template  JSRender Object    Template to be rendered
 * @param   data      JSON Object        Data for template to render
 * @param   el        String             HTML element to append to
 * 
 * Renders a JSrender template to the
 * given element containing data parsed.
 */
window.renderTemplate = function renderTemplate(template, data, el) {
    $(el).html(template.render(data));
};

/**
 * @param  template  Array of JSRender Objects    Template to be rendered
 * @param  data      JSON Object                  Data for template to render
 * @param  el        String                       HTML element to append template to.
 * 
 * Renders a multiple JSrender templates to the
 * given element containing data parsed.
 */
window.renderMultiple = function renderMultiple(template, data, el) {
    var html = "";
    data.forEach(function(item, i) {
        html += template[i].render(data[i]);
    });
    $(el).html(html);
};

//* Body Events
$(document).on("click", function(e) {
    //*To monitor events
    var target = e.target;

    if (target.id) {
        objectHasId(target.id);
    } else {
        objectHasNoId(target.classList);
    }
});

//* Button Events
$("#account-show").click(e => {
    hideAll(false);
    var account = $(".content-body.account");
    show(account);
});

$("#account-hide").on('click', (e) => {
    hideAll(false);
});

//* Load Linked Content
//! Giving up on templates until I at least have the basics of the app down
// require('./imports'); 

//* Load Main Content
$(document).ready((e) => {
    showMainContent();
});