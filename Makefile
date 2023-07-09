install:
	echo "In installation mode!"
	sudo su 
	apt upgrade
	apt update
	apt install realtek-rtl88xxau-dkms
	apt install nodejs
	apt install npm
	npm install