function toggleAccount() {
  var modal = $('#account-modal');
  if (modal.hasClass('hidden')) modal.removeClass('hidden')
  else modal.addClass('hidden')
}

function showMainContent() {
  var mainContent = $('.js-content');
  if (mainContent.hasClass('hidden'))
    $('.js-content').removeClass('hidden')
}