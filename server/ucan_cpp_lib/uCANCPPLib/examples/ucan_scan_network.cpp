
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

json PaseStepper(uCANnetID map_id, ucan_stepper::CANStatusFrame1 s2,time_t  timev);
json PasreLine(uCANnetID map_id, ucan_line_motor::CANStatusFrame1 status,time_t  timev);


void test_callback_function(can_frame *buffer) {
  memcpy(&status1, buffer->data, sizeof(CAN_MAX_DLEN));
  status_id.whole = buffer->can_id;
  counter++;
}

int main(int argc,     // Number of strings in array argv
         char *argv[], // Array of command-line argument strings
         char *envp[]) // Array of environment variable strings
{
  errno = 0;    
  char *p;
  const char *scan_interface = argv[1];
  long scan_len = strtol(argv[2], &p, 10);


  if (argc != 3 || errno != 0 || *p != '\0' || scan_len > INT_MAX) {
    std::cout << "uCAN devices scan utility, output is JSON format"
              << std::endl;
    std::cout << "usage: ucan_scan_network CAN_INTERFACE SCAN_TIME_IN_SECONDS"
              << std::endl;
    std::cout << "example: ucan_scan_network vcan0 10" << std::endl;
  } else {


    ucan_can_interface::set_interface_name(scan_interface);
    can_frame buffer;
    ucan_can_interface can_sock = ucan_can_interface(ucan_can_interface::interface_name);
    while (1)
    {
        if (can_sock.can_rx(&buffer) == 1)
        {
            uCANnetID map_id;
            map_id.whole =  buffer.can_id;
            time_t  timev;
            time(&timev);
            json j1;

            switch (map_id.type)
            {

            case ucan_line_motor::driver_id:
                if (map_id.frame_type == ucan_line_motor::status_frame_id)
                {
                    ucan_line_motor::CANStatusFrame1 status;
                    memcpy(&status,buffer.data,CAN_MAX_DLEN);
                    j1 = PasreLine(map_id,status,timev);
                    std::cout << j1.dump(4) << std::endl;
                }
                break;
            case ucan_stepper::driver_id:
                if (map_id.frame_type == ucan_stepper::status_frame_id)
                {
                    ucan_stepper::CANStatusFrame1 s2;
                    memcpy(&s2,buffer.data,CAN_MAX_DLEN);
                    j1 = PaseStepper(map_id, s2, timev);
                    std::cout << j1.dump(4) << std::endl;
                }
                break;
            default:
//                j1 = {
//                    {"timestamp", timev},
//                    {"id",
//                     {{"whole", map_id.whole},
//                      {"id", (uint32_t)map_id.id},
//                      {"device_type", (uint32_t)map_id.type},
//                      {"group", (uint32_t)map_id.group}}},
//                    {"data",
//                     {
//                         {"unknown", true}
//                     }}};
                 break;
            }

 //           return 0;
        }
    }
  }
}

 json PasreLine(uCANnetID map_id, ucan_line_motor::CANStatusFrame1 status, time_t  timev)
 {
     json j1;
      j1 += {
          {"timestamp", timev},
          {"id",
           {{"whole", map_id.whole},
            {"id", (uint32_t)map_id.id},
            {"device_type", (uint32_t)map_id.type},
            {"group", (uint32_t)map_id.group}}},
          {"data",
           {{"dir", (uint32_t)status.brushed.dir},
            {"pwm_value", (uint32_t)status.brushed.pwmValue},
            {"state", (uint32_t)status.brushed.state},
            {"whole", status.brushed.whole},
            {"positon", (uint32_t)status.sensors.Position},
            {"speed", (uint32_t)status.sensors.Speed},
            {"whole", status.sensors.whole},
          }
              }};
      return j1;
 }

 json PaseStepper(uCANnetID map_id, ucan_stepper::CANStatusFrame1 s2,time_t  timev)
 {
     json j1;
     j1 += {
         {"timestamp", timev},
         {"id",
          {{"whole", map_id.whole},
           {"id", (uint32_t)map_id.id},
           {"device_type", (uint32_t)map_id.type},
           {"group", (uint32_t)map_id.group}}},
         {"data",
          {{"nowStepping", (uint32_t)s2.stepper.nowStepping},
           {"StepCount", (uint32_t)s2.stepper.StepCount},
           {"whole", s2.stepper.whole},
           {"positon", (uint32_t)s2.sensors.Position},
           {"speed", (uint32_t)s2.sensors.Speed},
           {"whole", s2.sensors.whole},
         }
 }};
     return j1;
 }
