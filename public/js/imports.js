const links = document.querySelectorAll('link[rel="import"]')

// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
	let template = link.import.querySelector('.template')
	let clone = document.importNode(template.content, true)
	if (link.href.match('about.html')) {
		document.querySelector('body').appendChild(clone)
	} else {
		// Generate content here
		// Apply the blog post data to the template.
		// clone.querySelector('').innerText = '';
		document.querySelector('.content').appendChild(clone)
	}
})
//* document.createElement('clone')
//* If links have IDs document.getElementById('').import can import from body
//! JustForYou CODE FOR COFFEE