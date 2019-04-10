import cantools
import can

# can_bus = can.interface.Bus('COM7@115200', bustype='slcan')
can_bus = can.interface.Bus('vcan0', bustype='socketcan')
db = cantools.database.load_file('ucan.dbc')

status_msg = db.get_message_by_name('DCStatusFrame')
# print(status_msg.signals)


data = status_msg.encode({'PWM': 5, 
                          'breakingOn': 0, 
                          'dir': 0,
                          'speedControl': 0,
                          'positionControl': 0,
                          'RegulatorPosition': 0,
                          'RegulatorSpeed': 0
                        })

message = can.Message(arbitration_id=status_msg.frame_id, data=data)
can_bus.send(message)