#!/bin/sh

sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
ip link show vcan0
