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
json input_json;

template <typename T>
T cast_required(const char* field){
    if (input_json.count(field) == 0) {
        std::cout << "\"" << field << "\" field not found in input JSON." << std::endl;;
        exit(-1);
    }
    return input_json[field].get<T>();
}

int main(int argc,     // Number of strings in array argv
         char *argv[], // Array of command-line argument strings
         char *envp[]) // Array of environment variable strings
{
  const char *scan_interface = argv[1];
  const char *stirng_json = argv[2];




  if (argc != 3) {
    std::cout << "uCAN devices send utility, output is JSON format"
              << std::endl;
    std::cout << "usage: ucan_sender CAN_INTERFACE JSON_COMMAND"
              << std::endl;
    std::cout << "example: ucan_sender vcan0 \{\"id\":22,\"device_type\":\"STEPPER_MOTOR\",\"step_count\":20,\"step_size\":1,\"dir\":\"CLOCKWISE\"\}"
              << std::endl;
    // vcan0 \{\"id\":22,\"device_type\":\"LINE_MOTOR\",\"pwm\":220,\"dir\":\"CLOCKWISE\"\}
    // vcan0 \{\"id\":22,\"device_type\":\"LINE_MOTOR\",\"position_control\":\"\",\"position\":500\}
    return -1;
  }

  try {
    input_json = json::parse(stirng_json);

  } catch (...)
  {
       std::cout << "Invalid JSON format. Input string was " << stirng_json << std::endl;;
       return -1;
  }


    ucan_can_interface::set_interface_name(scan_interface);
    can_frame buffer = {0};
    uCANnetID id = {0};
    buffer.can_dlc = CAN_MAX_DLEN;
    ucan_can_interface can_sock = ucan_can_interface(ucan_can_interface::interface_name);

    id.id = cast_required<std::uint8_t>("id");
    std::string device_type = cast_required<std::string>("device_type");

    if (device_type  == "STEPPER_MOTOR")
    {
        ucan_stepper::CANStepperCMD1 cmd = {0};
        id.frame_type = ucan_stepper::command_id;
        id.type = ucan_stepper::driver_id;

        cmd.stepCount = cast_required<std::uint32_t>("step_count");

        if (cast_required<std::string>("dir") == "CLOCKWISE")
        {
            cmd.flags.dir = 1;
        } else
        {
            cmd.flags.dir = 0;
        }
        cmd.flags.stepSize = cast_required<std::uint32_t>("step_size");
        memcpy(&buffer.can_id,&id,sizeof(canid_t));
        memcpy(buffer.data,&cmd,CAN_MAX_DLEN);
        can_sock.can_send(buffer);
    }
    if (device_type == "LINE_MOTOR")
    {
        ucan_line_motor::CANBrushedCMD1 cmd = {0};
        id.frame_type = ucan_line_motor::command_id;
        id.type = ucan_line_motor::driver_id;

        if (input_json.count("position_control") || input_json.count("speed_control"))
        {
            if (input_json.count("position_control"))
            {
                cmd.directControl.positionControl = 1;
                cmd.regulatorControl.position = input_json["position"].get<std::int16_t>();
            }

            if (input_json.count("speed_control"))
            {
                cmd.directControl.speedControl= 1;
                cmd.regulatorControl.speed = input_json["speed"].get<std::int16_t>();
            }
        } else {
            //direct control
            cmd.directControl.pwm = cast_required<std::uint32_t>("pwm");
            if (input_json.count("breaking_on")) // optional
                cmd.directControl.breakingOn = cast_required<std::uint32_t>("breaking_on");
            auto str_dir = cast_required<std::string>("dir");
            if (str_dir  == "CLOCKWISE")
            {
                cmd.directControl.dir = 1;
            } else
            {
                cmd.directControl.dir = 0;
            }
        }
        memcpy(&buffer.can_id,&id,sizeof(canid_t));
        memcpy(buffer.data,&cmd,CAN_MAX_DLEN);
        can_sock.can_send(buffer);
    }


  std::cout << "sendig finished" << endl;
}

