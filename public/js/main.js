    window.$ = window.jQuery = require('jquery');
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
      show(mainContent);
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
        target = $('.content-body.account')
        show(target)
      } else if (id == "account-hide") {
        hideAll(true);
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

    function toggle() {
      if (object.hasClass('hidden'))
        object.removeClass('hidden');
      else
        object.addClass('hidden')
    }

    //* Button Events
    // $('#account-show').click((e) => {
    //   hideAll();
    //   account = $('.content-body.account')
    //   show(account);
    // })

    // $('#account-hide').on("click", (e) => {
    //   console.log("Hide Event")
    //   hideAll();
    // })

    //* Body Events
    $(document).on('click', function (e) {
      console.log($(this));
      console.log(e);
      var target = e.target;

      if (target.id) {
        objectHasId(target.id);
      } else {
        objectHasNoId(target.classList);
      }
    })

    //* Load Main Content
    $(document).ready((e) => {
      showMainContent();
    })