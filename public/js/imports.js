require()
const links = document.querySelectorAll('link[rel="import"]')

// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
	let template = link.import.querySelector('.template')
	// console.log(template.content)
	let clone = document.importNode(template.content, true)
	// console.log(link.href);
	if (link.href.match('account.html')) {
		// console.log('match');
		document.querySelector('body').appendChild(clone)
	} else {
		document.querySelector('.content').appendChild(clone)
	}
})