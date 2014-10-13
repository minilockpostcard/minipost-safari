default: bundle

update:
	git --work-tree=minipost --git-dir=minipost/.git pull
	git --work-tree=minipost --git-dir=minipost/.git reset --hard origin/deploy

bundle: bundle/safari.global.html bundle/safari.global.js bundle/miniLockLib.js bundle/minipost.js bundle/examples bundle/certificates
	ditto minipost/index.html bundle/index.html
	ditto minipost/unlock.html bundle/unlock.html
	ditto minipost/write.html bundle/write.html

bundle/safari.global.html:
	echo '<script src="safari.global.js" charset="UTF-8"></script>' > bundle/safari.global.html

bundle/safari.global.js: safari.global.coffee
	coffee --print --compile safari.global.coffee > bundle/safari.global.js

bundle/miniLockLib.js: minipost
	ditto minipost/miniLockLib.js bundle/miniLockLib.js

bundle/minipost.js: minipost
	ditto minipost/minipost.js bundle/minipost.js

bundle/examples: minipost
	ditto minipost/examples bundle/examples

bundle/certificates: minipost
	ditto minipost/certificates bundle/certificates

minipost:
	git clone git@github.com:minipostlink/minipost.git
	cd minipost; git reset --hard origin/deploy;

clean:
	rm -rf minipost
	rm -rf bundle/examples
	rm -rf bundle/certificates
	rm -f bundle/*.html
	rm -f bundle/*.js
