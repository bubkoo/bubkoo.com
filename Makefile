now = `date +'%Y-%m-%d %H:%M:%S'`

copy:
	cp -a public/ .deploy/

deploy:
	cd .deploy && git status && git add -A . && git commit -m "Site updated: $(now)" && git push origin master
	#git add -A . &&
	#git commit -m $(now) &&
	#git push origin master
