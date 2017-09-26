#!/bin/bash
slcand -s3 -o /dev/ttyACM1 slcan0

ifconfig slcan0 up

#candump any

