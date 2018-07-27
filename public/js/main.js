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
 * @param content string
 ** String containing class name
 ** of a content div to be shown
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
 * @param def boolean
 ** Returns buttons to original states 
 *
 * Switches buttons based upon whether 
 * account creation div is shown
 */
function switchButtons(def) {
    if (def) {
        show($('#account-show'));
        hide($('#account-hide'));
    } else {
        toggle($('#account-show'));
        toggle($('#account-hide'));
    }
}

/**
 * @param showMain boolean
 ** Shows the main content body
 * 
 * Returns all content to original
 * hidden state
 */
function hideAll(showMain = true) {
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
}

/**
 * @param id string
 ** id being interacted with by event
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
 * @param object Object
 ** The object to show
 * 
 * shows the provided object
 * provided it has the class hidden
 */
function show(object) {
    if (object.hasClass('hidden')) {
        object.removeClass('hidden');
    }
}

/**
 * @param object Object
 ** The object to hide
 * 
 * hides the provided object
 */
function hide(object) {
    if (!object.hasClass('hidden')) {
        object.addClass('hidden');
    }
}

/**
 * @param object Object
 ** The object to apply or remove hidden from
 * 
 * Toggles the hidden status
 * of the provided object
 * using hidden class
 */
function toggle(object) {
    if (object.hasClass('hidden')) {
        object.removeClass('hidden');
    } else {
        object.addClass("hidden");
    }
}

//* JS Render Functions
/**
 * @param template JSRender Object
 ** Name of template to be rendered
 * @param data JSON Object
 ** Data for template to render
 * @param el string
 ** HTML element to append template to.
 * 
 * Renders a JSrender template to the
 * given element containing data parsed.
 */
window.renderTemplate = function renderTemplate(template, data, el) {
    $(el).html(template.render(data));
};

/**
 * @param template Array of JSRender Objects
 ** Name of template to be rendered
 * @param data JSON Object
 ** Data for template to render
 * @param el string
 ** HTML element to append template to.
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
    // console.log($(this));
    // console.log(e);
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