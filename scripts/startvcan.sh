#!/bin/sh

 modprobe vcan
 ip link add dev vcan0 type vcan
 ip link set up vcan0
 mosquitto -p 1884 &
 node-red -p 1882