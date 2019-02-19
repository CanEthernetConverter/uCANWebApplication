#!/bin/bash
ip link set $1 type can bitrate 100000
ifconfig $1 up
