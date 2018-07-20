var $ = require('jquery');
require('./imports');

// $(document).ready(function () {
//https://github.com/electron/electron-api-demos/blob/5f980e5c2df570eb399e8e9a82068fb3cb73ca51/assets/nav.js
$('#modal-show').on('click', (e) => {
  e.preventDefault();
  // console.log(event.target.id);
  // if (event.target.id == 'modal-show' || event.target.id == 'modal-hide') {
  // console.log('true');
  toggleAccount(event);
  // }
})
$('#modal-hide').on('click', (e) => {
  e.preventDefault();
  // console.log(event.target.id);
  // if (event.target.id == 'modal-show' || event.target.id == 'modal-hide') {
  // console.log('true');
  toggleAccount(event);
  // }
})

function toggleAccount() {
  var modal = $('.account');
  console.log(modal);
  if (modal.hasClass('hide')) modal.removeClass('hide');
  else modal.addClass('hide');
}

function showMainContent() {
  var mainContent = $('.js-content');
  if (mainContent.hasClass('hidden'))
    $('.js-content').removeClass('hidden')
}
// })