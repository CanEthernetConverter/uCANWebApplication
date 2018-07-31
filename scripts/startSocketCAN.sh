#!/bin/bash
slcand -s8 -o /dev/"$1" slcan0

ifconfig slcan0 up

#candump any

