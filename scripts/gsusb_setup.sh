#!/bin/bash
ip link set $1 type can bitrate $2
ifconfig $1 up
