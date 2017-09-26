
#include "./../src/json.hpp"
#include "./../src/ucan_line_motor.h"
#include "./../src/ucan_stepper.h"
#include "./../src/ucan_tools.h"
#include <chrono>
#include <iostream>
#include <limits.h>
#include <linux/can.h>
#include <thread>

using namespace std;
using namespace std::chrono;
using namespace std::chrono_literals;
using json = nlohmann::json;

ucan_stepper::CANStatusFrame1 status1;
uCANnetID status_id;
int counter = 0;

void test_callback_function(can_frame *buffer) {
  memcpy(&status1, buffer->data, sizeof(CAN_MAX_DLEN));
  status_id.whole = buffer->can_id;
  counter++;

  //    printf("CAN_ID type %08x \n\r", status_id.type);
  //    printf("CAN_ID id %08x \n\r", status_id.id);
  //    printf("CAN_ID frame_type %08x \n\r", status_id.frame_type);
  //    printf("CAN_ID %08x \n\r", buffer->can_id);

  //    printf("STEPPER_SPEED %08x, POSITION %08x \n\r", status1.sensors.Speed,
  //    status1.sensors.Position);
}

int main(int argc,     // Number of strings in array argv
         char *argv[], // Array of command-line argument strings
         char *envp[]) // Array of environment variable strings
{

  //  int count;
  //  cout << "\nCommand-line arguments:\n";
  //  for (count = 0; count < argc; count++)
  //    cout << "  argv[" << count << "]   " << argv[count] << "\n";

  errno = 0;
  char *p;
  const char *scan_interface = argv[1];
  long scan_len = strtol(argv[2], &p, 10);
  bool first = true;

  if (argc != 3 || errno != 0 || *p != '\0' || scan_len > INT_MAX) {
    std::cout << "uCAN devices scan utility, output is JSON format"
              << std::endl;
    std::cout << "usage: ucan_discover CAN_INTERFACE SCAN_TIME_IN_SECONDS"
              << std::endl;
    std::cout << "example: ucan_discover vcan0 10" << std::endl;
    std::cout << "output: { {LAST_ACTIVITY_TIMESTAP, CAN_ID}," << std::endl;
    std::cout << " {LAST_ACTIVITY_TIMESTAP, CAN_ID}}" << std::endl;
  } else {
    uint8_t found_id = 0;
    ucan_can_interface::set_interface_name(scan_interface);
    ucan_tools::scan_for_devices(scan_len);

    json result;

    for (const auto &kv : ucan_tools::active_devices) {
      json j1 = {
          {"timestamp", kv.second.activity_time},
          {"id",
           {{"whole", kv.second.id.whole},
            {"id", kv.second.id.id},
            {"device_type", kv.second.id.type},
            {"group", kv.second.id.group}}},
      };

      result += j1;
    }
    std::cout << result.dump(4) << std::endl;
  }
}
