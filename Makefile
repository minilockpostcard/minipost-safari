default: bundle

bundle: bundle/safari.global.html bundle/safari.global.js bundle/unlock.html bundle/write.html bundle/miniLockLib.js bundle/minipost.js

bundle/unlock.html: minipost
	ditto minipost/unlock.html bundle/unlock.html

bundle/write.html: minipost
	ditto minipost/write.html bundle/write.html

bundle/safari.global.html:
	echo '<script src="safari.global.js" charset="UTF-8"></script>' > bundle/safari.global.html

bundle/safari.global.js: safari.global.coffee
	coffee --print --compile safari.global.coffee > bundle/safari.global.js

bundle/miniLockLib.js: minipost
	ditto minipost/miniLockLib.js bundle/miniLockLib.js

bundle/minipost.js: minipost
	ditto minipost/minipost.js bundle/minipost.js

minipost:
	git clone git@github.com:minipostlink/minipost.git
	cd minipost; git reset --hard origin/deploy;

clean:
	rm -rf minipost
	rm -f bundle/*.html
	rm -f bundle/*.js
