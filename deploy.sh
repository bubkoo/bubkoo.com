cp -a public/ .deploy_git/
cd .deploy_git
git add -A .
git commit -m "Site updated: YYYY-MM-DD HH:mm:ss"
git push
