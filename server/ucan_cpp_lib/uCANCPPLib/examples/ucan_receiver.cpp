
#include "./../src/json.hpp"
#include "./../src/ucan_line_motor.h"
#include "./../src/ucan_stepper.h"
#include "./../src/ucan_tools.h"
#include <chrono>
#include <cstdlib>
#include <iostream>
#include <limits.h>
#include <linux/can.h>
#include <thread>
#include <vector>

using namespace std;
using namespace std::chrono;
using namespace std::chrono_literals;
using json = nlohmann::json;

void callback_function(can_frame *buffer) {

  uCANnetID status_id;
  status_id.whole = buffer->can_id;

  json j1 = {{"id",
              {{"whole", (uint32_t)status_id.id},
               {"device_type", (uint32_t)status_id.type},
               {"frame_type", (uint32_t)status_id.frame_type},
               {"group", (uint32_t)status_id.group}}}};

  json j2;

  switch (status_id.type) {
  case ucan_stepper::driver_id: {
    ucan_stepper::CANStatusFrame1 s1;
    memcpy(&s1, buffer->data, CAN_MAX_DLEN);

    j2 = {{"sensors",
           {{"Position", s1.sensors.Position}, {"Speed", s1.sensors.Speed}},
           "stepper",
           {{"StepCount", (uint32_t)s1.stepper.StepCount},
            {"nowStepping", (uint32_t)s1.stepper.nowStepping}}}};

    break;
  }

  case ucan_line_motor::driver_id: {
    ucan_line_motor::CANStatusFrame1 s1;
    memcpy(&s1, buffer->data, CAN_MAX_DLEN);

    j2 = {{"sensors",
           {{"Position", s1.sensors.Position}, {"Speed", s1.sensors.Speed}},
           "brushed",
           {{"dir", (uint32_t)s1.brushed.dir},
            {"pwmValue", (uint32_t)s1.brushed.pwmValue},
            {"state", (uint32_t)s1.brushed.state}}}};

    break;
  }

  default:
    break;
  }
  std::cout << j1.dump(4) << j2.dump(4) << std::endl;
}

std::vector<ucan_device<ucan_stepper> *> steppers;
std::vector<ucan_device<ucan_line_motor> *> line;

void exiting() {
  std::cout << "Exiting";

  for (auto n : steppers) {
    free(n);
  }

  for (auto n : line) {
    free(n);
  }
}

int main(int argc,     // Number of strings in array argv
         char *argv[], // Array of command-line argument strings
         char *envp[]) // Array of environment variable strings
{
  errno = 0;
  char *p;

  if (argc < 3 || errno != 0) {
    std::cout << "uCAN devices reception utility, output is JSON format"
              << std::endl;
    std::cout << "usage: ucan_receiver CAN_INTERFACE UCAN_ID UCAN_TYPE"
              << std::endl;
    std::cout << "example: ucan_receiver vcan0 12 5" << std::endl;

    exit(0);
  }

  const char *scan_interface = argv[1];
  long can_id = strtol(argv[2], &p, 10);

  long can_type = strtol(argv[3], &p, 10);

  std::atexit(exiting);

  ucan_can_interface::set_interface_name(scan_interface);

  const char *device_type = argv[3];
  int deviceType = ucan_line_motor::driver_id;

  if (ucan_stepper::driver_id == can_type) {
    std::cout << "stepper add " << can_id << std::endl;
    ucan_device<ucan_stepper> *s = new ucan_device<ucan_stepper>(can_id);
    s->recive_frame(callback_function, ucan_stepper::status_frame_id);
    steppers.push_back(s);
  } else if (ucan_line_motor::driver_id == can_type) {
    std::cout << "line_add  " << can_id << std::endl;
    ucan_device<ucan_line_motor> *l = new ucan_device<ucan_line_motor>(can_id);
    l->recive_frame(callback_function, ucan_line_motor::status_frame_id);
    line.push_back(l);
  } else {
    std::cout << "unknown type  " << can_type << std::endl;
  }

  while (1) {
    std::this_thread::sleep_for(100ms);
  }
}
