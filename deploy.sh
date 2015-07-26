cp -a public/ .deploy/
cd .deploy
git add -A .
git commit -m "Site updated: YYYY-MM-DD HH:mm:ss"
git push