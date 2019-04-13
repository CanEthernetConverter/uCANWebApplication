import cantools
import can
import sys


# can_bus = can.interface.Bus('COM7@115200', bustype='slcan')
can_bus = can.interface.Bus('can0', bustype='socketcan')
db = cantools.database.load_file('motor/ucan.dbc')
status_msg = db.get_message_by_name('DCControlFrame')
command_msg = db.get_message_by_name('DCStatusFrame')

data = command_msg.encode({ 'PWM': 0, 
                            'breakingOn': 0, 
                            'dir': 0,
                            'speedControl': 0,
                            'positionControl': 0,
                            'RegulatorPosition': int(sys.argv[1]),
                            'RegulatorSpeed': 0
                            })

message = can.Message(arbitration_id=command_msg.frame_id, data=data)
can_bus.send(message)
# time.sleep(2)
