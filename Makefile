now = `date +'%Y-%m-%d %H:%M:%S'`

copy:
	cp -a public/ .deploy/

deploy:
	cd .deploy
	git add -A .
	git commit -m "%Y-%m-%d %H:%M:%S"
	git push

echo:
	echo $(now)
