now = `date +'%Y-%m-%d %H:%M:%S'`

copy:
	cp -a public/ .deploy/

deploy:
	cp -a public/ .deploy/
	cd .deploy
	git add -A .
	git commit -m $(now)
	git status
	#git push origin master

echo:
	echo $(now)
