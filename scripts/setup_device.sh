#!/bin/bash
#echo "gs_usb" >> /etc/modules
#echo "can_dev" >> /etc/modules
#echo "ucan" > /etc/hostname

#sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y;
#curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
#sudo apt-get install -y nodejs

#sudo apt-get install -y can-utils
#sudo apt-get install -y mosquitto
#sudo apt-get install -y node-gyp
#sudo npm install -g node-red

#git clone https://github.com/CanEthernetConverter/uCANWebApplication.git
#cd uCANWebApplication/server/
#npm install

#automout usb
#new release is neede d
#sudo apt-get install -y usbmount 
#dpkg -i ~/uCANWebApplication/usbmount_0.0.24_all.deb
#ln -s /media/usb0 ~/uCANWebApplication/server/logs
#add to autostart
cp ~/uCANWebApplication/scripts/startucanserver /etc/init.d/
chmod +x /etc/init.d/startucanserver
update-rc.d startucanserver defaults
update-rc.d startucanserver enable
