// $(document).ready(function () {
//https://github.com/electron/electron-api-demos/blob/5f980e5c2df570eb399e8e9a82068fb3cb73ca51/assets/nav.js
$('body').on('click', (e) => {
  e.preventDefault();
  if (event.target.id = '#modal-show') {
    // console.log('true');
    toggleAccount(event);
  }
})

function toggleAccount() {
  var modal = $('#account-modal');
  if (modal.hasClass('show')) modal.removeClass('show');
  else modal.addClass('show');
}

function showMainContent() {
  var mainContent = $('.js-content');
  if (mainContent.hasClass('hidden'))
    $('.js-content').removeClass('hidden')
}
// })