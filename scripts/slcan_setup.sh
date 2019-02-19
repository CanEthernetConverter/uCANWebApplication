#!/bin/bash
slcand -s8 -o /dev/$1 $2
ifconfig $2 up
