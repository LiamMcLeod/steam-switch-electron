    window.$ = window.jQuery = require('jquery');
    require('./imports');

    $('#modal-show').on('click', (e) => {
      e.preventDefault();
      toggleAccount(event);
    })
    $('#modal-hide').on('click', (e) => {
      e.preventDefault();
      toggleAccount(event);
    })

    function toggleModal() {
      var modal = $('#modal');
      hideAll();
      // console.log(modal);
      if (modal.hasClass('hide')) modal.removeClass('hide');
      else modal.addClass('hide');
    }

    function showContent(content) {
      var content = $('.content-body .' + content);
      if (content.hasClass('hidden'))
        $('.list').removeClass('hidden');
    }

    function showMainContent() {
      var mainContent = $('.content-body.list');
      hideAll();
      if (mainContent.hasClass('hidden'))
        mainContent.removeClass('hidden');
    }

    function hideAll() {
      var content = $('.content-body');
      var modal = $('#modal');

      if (!content.hasClass('hidden'))
        content.addClass('hidden');
      if (!modal.hasClass('hidden'))
        modal.addClass('hidden');

      showMainContent();
    }

    $(document).click((e) => {
      // e.preventDefault();
      var target = e.target;
      target = e.target; //e.target.id;
      console.log(target);
      if (target.id == "account") {
        target = $('.content-body.account')
        if (target.hasClass('hidden'))
          target.removeClass('hidden');
      }
    })

    $(document).ready((e) => {
      // console.log("ready");
      showMainContent();
    })