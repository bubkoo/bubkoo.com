copy:
	cp -a public/ .deploy/

deploy:
	cd .deploy
	git add -A .
	git commit -m "`date +'%Y-%m-%d %H:%M:%S'`"
	git push

echo:
	echo `date +'%Y-%m-%d %H:%M:%S'`
