#!/bin/bash
if [ "$1" = "master" ]
then
   echo "LIN"$2 " MASTER"
   slcand -s8 -o /dev/ttyACM$2 lin$2
   sleep .1
   ifconfig lin$2 up
else
   echo "LIN"$2 " MONITOR"
   slcand -s8 -l /dev/ttyACM$2 lin$2
   sleep .1
   ifconfig lin$2 up
fi
