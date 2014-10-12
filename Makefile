default: safari.global.js minipost/index.html

safari.global.js: safari.global.coffee
	coffee --compile safari.global.coffee

minipost:
	git clone git@github.com:minipostlink/minipost.git

minipost/index.html: minipost
	cd minipost; git pull; npm install; make index.html;

clean:
	rm -rf minipost
	rm safari.global.js
