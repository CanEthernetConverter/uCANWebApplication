import cantools
import can
import threading, time, sys, os
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("$CAN/#")

def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))

def commandFrameThread():
    while(1):                
        rx_message = can_bus.recv()
        if (status_msg.frame_id == rx_message.arbitration_id):
                print("CAN> ")
                frame = db.decode_message(rx_message.arbitration_id, rx_message.data)
                print(frame)
                motorSetPoint = frame["RegulatorPosition"] 
                client.publish("CAN/motorPosition", motorSetPoint)

# can_bus = can.interface.Bus('/dev/ttyS7@115200', bustype='slcan')

can_bus = can.interface.Bus('can0', bustype='socketcan')

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)
#client.loop_forever()

db = cantools.database.load_file('motor/ucan.dbc')
status_msg = db.get_message_by_name('DCControlFrame')
command_msg = db.get_message_by_name('DCStatusFrame')

w_rx = threading.Thread(target=commandFrameThread) 
w_rx.start()

raw_input("Press Enter to continue...")
os._exit(1)


