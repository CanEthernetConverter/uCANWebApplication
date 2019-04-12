import cantools
import can
import motor_sim
import threading, time, sys, os

can_bus = can.interface.Bus('vcan0', bustype='socketcan')
db = cantools.database.load_file('ucan.dbc')
status_msg = db.get_message_by_name('DCControlFrame')
command_msg = db.get_message_by_name('DCStatusFrame')
# can_bus = can.interface.Bus('COM7@115200', bustype='slcan')
# print(status_msg.signals)
        
sim_len = 100
sensorPositionVal = 0
motorSetPoint = 0
sim_data = [0]
sim_index = 0

def statusFrameThread():
    global sim_index
    global sim_data

    while (1):
        i = len(sim_data) - 1
        if sim_index < i:
            sim_index = sim_index + 1
        if (sim_data[sim_index] < 0):
            sim_data[sim_index] = 0
        data = status_msg.encode({'SensorSpeed': 0, 
                                'SensorPosition': sim_data[sim_index], 
                                'BrushState': 0,
                                'BrushDir': 0,
                                'BrushPWM': 0
                                })
        message = can.Message(arbitration_id=status_msg.frame_id, data=data)
        can_bus.send(message)
        time.sleep(0.02)

def commandFrameThread():
    global sim_index
    global sim_data

    while(1):                
        rx_message = can_bus.recv()
        if (command_msg.frame_id == rx_message.arbitration_id):
            print("CAN> ")
            frame = db.decode_message(rx_message.arbitration_id, rx_message.data)
            print(frame)
            motorSetPoint = frame["RegulatorPosition"] 
            
            sim_data = motor_sim.start_sim(motorSetPoint,sim_data[sim_index],sim_len)
            sim_index = 0

w_tx = threading.Thread(target=statusFrameThread) 
w_tx.start()

w_rx = threading.Thread(target=commandFrameThread) 
w_rx.start()

raw_input("Press Enter to continue...")
os._exit(1)

