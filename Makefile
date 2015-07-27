dir = .deploy_git
msg = Update from travis: `date +'%Y-%m-%d %H:%M:%S'`

update:
	cd $(dir) && git rm -rf *
	cp -a public/* $(dir)

deploy:
	cd $(dir) && git add -A && git commit -m "$(msg)" && git push origin master
