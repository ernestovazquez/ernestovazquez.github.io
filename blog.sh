git pull
git add .
echo -n "Escribir mensaje para el commit: "
read msg
git commit -m "$msg"
git push origin master
