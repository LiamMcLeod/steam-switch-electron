/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

eval("// $(document).ready(function () {\r\n//https://github.com/electron/electron-api-demos/blob/5f980e5c2df570eb399e8e9a82068fb3cb73ca51/assets/nav.js\r\n$('#modal-show').on('click', function (e) {\r\n  e.preventDefault();\r\n  // console.log(event.target.id);\r\n  // if (event.target.id == 'modal-show' || event.target.id == 'modal-hide') {\r\n  // console.log('true');\r\n  toggleAccount(event);\r\n  // }\r\n})\r\n$('#modal-hide').on('click', function (e) {\r\n  e.preventDefault();\r\n  // console.log(event.target.id);\r\n  // if (event.target.id == 'modal-show' || event.target.id == 'modal-hide') {\r\n  // console.log('true');\r\n  toggleAccount(event);\r\n  // }\r\n})\r\n\r\nfunction toggleAccount() {\r\n  var modal = $('.account');\r\n  console.log(modal);\r\n  if (modal.hasClass('hide')) modal.removeClass('hide');\r\n  else modal.addClass('hide');\r\n}\r\n\r\nfunction showMainContent() {\r\n  var mainContent = $('.js-content');\r\n  if (mainContent.hasClass('hidden'))\r\n    $('.js-content').removeClass('hidden')\r\n}\r\n// })//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9wdWJsaWMvanMvbWFpbi5qcz9mNDg1Il0sInNvdXJjZXNDb250ZW50IjpbIi8vICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuLy9odHRwczovL2dpdGh1Yi5jb20vZWxlY3Ryb24vZWxlY3Ryb24tYXBpLWRlbW9zL2Jsb2IvNWY5ODBlNWMyZGY1NzBlYjM5OWU4ZTlhODIwNjhmYjNjYjczY2E1MS9hc3NldHMvbmF2LmpzXHJcbiQoJyNtb2RhbC1zaG93Jykub24oJ2NsaWNrJywgKGUpID0+IHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgLy8gY29uc29sZS5sb2coZXZlbnQudGFyZ2V0LmlkKTtcclxuICAvLyBpZiAoZXZlbnQudGFyZ2V0LmlkID09ICdtb2RhbC1zaG93JyB8fCBldmVudC50YXJnZXQuaWQgPT0gJ21vZGFsLWhpZGUnKSB7XHJcbiAgLy8gY29uc29sZS5sb2coJ3RydWUnKTtcclxuICB0b2dnbGVBY2NvdW50KGV2ZW50KTtcclxuICAvLyB9XHJcbn0pXHJcbiQoJyNtb2RhbC1oaWRlJykub24oJ2NsaWNrJywgKGUpID0+IHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgLy8gY29uc29sZS5sb2coZXZlbnQudGFyZ2V0LmlkKTtcclxuICAvLyBpZiAoZXZlbnQudGFyZ2V0LmlkID09ICdtb2RhbC1zaG93JyB8fCBldmVudC50YXJnZXQuaWQgPT0gJ21vZGFsLWhpZGUnKSB7XHJcbiAgLy8gY29uc29sZS5sb2coJ3RydWUnKTtcclxuICB0b2dnbGVBY2NvdW50KGV2ZW50KTtcclxuICAvLyB9XHJcbn0pXHJcblxyXG5mdW5jdGlvbiB0b2dnbGVBY2NvdW50KCkge1xyXG4gIHZhciBtb2RhbCA9ICQoJy5hY2NvdW50Jyk7XHJcbiAgY29uc29sZS5sb2cobW9kYWwpO1xyXG4gIGlmIChtb2RhbC5oYXNDbGFzcygnaGlkZScpKSBtb2RhbC5yZW1vdmVDbGFzcygnaGlkZScpO1xyXG4gIGVsc2UgbW9kYWwuYWRkQ2xhc3MoJ2hpZGUnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd01haW5Db250ZW50KCkge1xyXG4gIHZhciBtYWluQ29udGVudCA9ICQoJy5qcy1jb250ZW50Jyk7XHJcbiAgaWYgKG1haW5Db250ZW50Lmhhc0NsYXNzKCdoaWRkZW4nKSlcclxuICAgICQoJy5qcy1jb250ZW50JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXHJcbn1cclxuLy8gfSlcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gcHVibGljL2pzL21haW4uanMiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7Ozs7QUFJQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7QUFJQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }
/******/ ]);