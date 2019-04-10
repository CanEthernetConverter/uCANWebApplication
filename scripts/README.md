# Thanks for using ucan software

## Quick-start

There is no auto configuration of can/lin converters on device startup.

If You have USB CAN converter connected

`cd scripts`

`./gsusb_setup.sh can0`

`candump any`

If You have USB LIN converter connected

`cd scripts`

`./lin_setup.sh monitor 0`

`candump any`

## Image consist of

- "firmwares" directory have binary files for LIN and CAN converters that can be uploaded via USB using DFU-Util

- "scripts" various script to setup CAN/LIN or upload new firmware to USB converters

## Tools

- various tools to use see individual README

## uCANWebApplication

- application form uCAN to use with converter see individual README
