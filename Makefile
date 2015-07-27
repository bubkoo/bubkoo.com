now = `date +'%Y-%m-%d %H:%M:%S'`

copy:
	cp -a public/ .deploy_git/

deploy:
	cd .deploy_git && git status && git add -A && git commit -m "Site updated: $(now)" && git push origin master
