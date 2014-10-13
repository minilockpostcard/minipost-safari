default: safari.global.js minipost

safari.global.js: safari.global.coffee
	coffee --compile safari.global.coffee

minipost:
	git clone git@github.com:minipostlink/minipost.git
	cd minipost; git reset --hard origin/deploy;

update: minipost
	cd minipost; git pull; git reset --hard origin/deploy;

clean:
	rm -rf minipost
	rm safari.global.js
