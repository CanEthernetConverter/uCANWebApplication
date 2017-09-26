#define CATCH_CONFIG_MAIN // This tells Catch to provide a main() - only do this
                          // in one cpp file
#include "catch.hpp"
#include "./../src/ucan_line_motor.h"
#include "./../src/ucan_stepper.h"
#include "./../src/ucan_tools.h"
#include <chrono>
#include <iostream>
#include <thread>
#include <linux/can.h>


using namespace std;
using namespace std::chrono;
using namespace std::chrono_literals;

TEST_CASE("uCAN Stepper driver creation", "[stepper]") {

  ucan_can_interface::set_interface_name("vcan0");

  ucan_device<ucan_stepper> s = ucan_device<ucan_stepper>(7);
  REQUIRE(s.get_id().id == 7);
}

TEST_CASE("uCAN Stepper command creatation", "[stepper]") {
  ucan_stepper c = ucan_stepper(
      {ucan_stepper::micro16, ucan_stepper::rotate_clockwhise, 0, 254}, 10ms, 3);
  REQUIRE(c.toString() == "04010000fe000000");
}

TEST_CASE("uCAN Line motor command creatation", "[line_motor]") {

  ucan_line_motor::CANBrushedCMD1 cmd{{100, 0}};
  ucan_line_motor c = ucan_line_motor(cmd, 10ms, 3);
  REQUIRE(c.toString() == "6400000000000000");
}
TEST_CASE("uCAN Stepper toString", "[stepper]") {
  ucan_device<ucan_stepper> s = ucan_device<ucan_stepper>(7);

  ucan_stepper::CANStepperCMD1 cmd{
      {ucan_stepper::micro16, ucan_stepper::rotate_clockwhise, 0, 100}};

  s.add(ucan_stepper(cmd, 10ms, 1));

  REQUIRE(s.get_command_in_queue(0).toString() == "0401000064000000");
}

TEST_CASE("uCAN Stepper executing commands", "[stepper]") {
  ucan_device<ucan_stepper> s = ucan_device<ucan_stepper>(7);
  s.add(ucan_stepper(
      {ucan_stepper::micro16, ucan_stepper::rotate_clockwhise, 0, 14}, 10ms,
      3));
  s.add(ucan_stepper(
      {ucan_stepper::micro16, ucan_stepper::rotate_clockwhise, 0, 15}, 100ms,
      5));

  ucan_device<ucan_line_motor> l = ucan_device<ucan_line_motor>(7);
  l.add(ucan_line_motor({100, 0}, 150ms, 3));

  s.execute();
  l.execute();

  std::this_thread::sleep_for(1s);
}

ucan_stepper::CANStatusFrame1 status1;
uCANnetID status_id;

volatile int counter = 0;
void callback_function(can_frame *buffer)
{

    memcpy(&status1,buffer->data,sizeof(CAN_MAX_DLEN));
    status_id.whole = buffer->can_id;
    counter ++;
//    printf("c1 \n\r");
//    printf("CAN_ID type %08x \n\r", status_id.type);
//    printf("CAN_ID id %08x \n\r", status_id.id);
//    printf("CAN_ID frame_type %08x \n\r", status_id.frame_type);
//    printf("CAN_ID %08x \n\r", buffer->can_id);

//    printf("STEPPER_SPEED %08x, POSITION %08x \n\r", status1.sensors.Speed, status1.sensors.Position);
}

TEST_CASE("Recive CAN Frame", "[rx]"){
   ucan_device<ucan_stepper> s = ucan_device<ucan_stepper>(15);

   auto id = s.get_id();
   s.recive_frame(callback_function, ucan_stepper::status_frame_id);
   counter = 0;
   system("canplayer -I ./candump_p257_s1025 -t -g 100 -l4");

   std::this_thread::sleep_for(100ms);

   REQUIRE(counter == 4);
   REQUIRE(status1.sensors.Speed == 0x00000401);
   REQUIRE(status1.sensors.Position == 0x00000101);
   REQUIRE(status_id.id == 15);
   REQUIRE(status_id.type == MOTOR_DRIVER_ID_STEPPER);
   REQUIRE(status_id.frame_type == MOTOR_CONTROL_FRAME_ID);
}

TEST_CASE("Scan for devices", "[rx]"){

    REQUIRE(ucan_tools::active_devices.size() == 0);

    system("canplayer -I ./candump_p257_s1025 -t -g 100 -l3 &");
    ucan_tools::scan_for_devices(5);

    REQUIRE(ucan_tools::active_devices.size() == 1);

    std::this_thread::sleep_for(1000ms);
    system("canplayer -I ./candump_2devices -g 100 -l2 &");
    ucan_tools::scan_for_devices(10);

    REQUIRE(ucan_tools::active_devices.size() == 3);

//    std::cout << "List scan devices" << std::endl;
//    for (const auto& kv : ucan_tools::active_devices) {
//        std::cout << kv.second.activity_time << " -- " << kv.second.id.id << std::endl;
//    }

    ucan_tools::active_devices.clear();
}

TEST_CASE("Scan and reception", "[rx]"){
    REQUIRE(ucan_tools::active_devices.size() == 0);
    counter = 0;

    ucan_device<ucan_stepper> s = ucan_device<ucan_stepper>(15);
    auto id = s.get_id();

    s.recive_frame(callback_function, ucan_stepper::status_frame_id);

    system("canplayer -I ./candump_p257_s1025 -t -g 100 -l3 &");

    ucan_tools::scan_for_devices(5);

    REQUIRE(counter > 0);
    REQUIRE(ucan_tools::active_devices.size() == 1);

    ucan_tools::active_devices.clear();
}

volatile int counter2 = 0;
void callback_function2(can_frame *buffer)
{
    uCANnetID status_id2;
    status_id2.whole = buffer->can_id;
//    printf("c2 \n\r");
//    printf("CAN_ID type %08x \n\r", status_id2.type);
//    printf("CAN_ID id %08x \n\r", status_id2.id);
//    printf("CAN_ID frame_type %08x \n\r", status_id2.frame_type);
//    printf("CAN_ID %08x \n\r", buffer->can_id);

    counter2 ++;
}

volatile int counter3 = 0;
void callback_function3(can_frame *buffer)
{
//    printf("c3 \n\r");
    counter3 ++;
}

TEST_CASE("Two devices reception", "[rx]"){

    counter2 = 0;
    counter3 = 0;
    counter = 0;

    ucan_device<ucan_stepper> s = ucan_device<ucan_stepper>(15);
    ucan_device<ucan_stepper> s2 = ucan_device<ucan_stepper>(0x0C);
    ucan_device<ucan_stepper> s3 = ucan_device<ucan_stepper>(1);

    s.recive_frame(callback_function, ucan_stepper::status_frame_id);
    s2.recive_frame(callback_function2, ucan_stepper::status_frame_id);
    s3.recive_frame(callback_function3, ucan_stepper::status_frame_id);

    system("canplayer -I ./candump_2devices -g 100 -l2 &");

    std::this_thread::sleep_for(2000ms);

    REQUIRE(counter3 == 0);
    REQUIRE(counter2 > 0);
    REQUIRE(counter > 0);
}



void test_callback_function(can_frame *buffer)
{
    memcpy(&status1,buffer->data,sizeof(CAN_MAX_DLEN));
    status_id.whole = buffer->can_id;
    counter ++;

    printf("CAN_ID type %08x \n\r", status_id.type);
    printf("CAN_ID id %08x \n\r", status_id.id);
    printf("CAN_ID frame_type %08x \n\r", status_id.frame_type);
    printf("CAN_ID %08x \n\r", buffer->can_id);

    printf("STEPPER_SPEED %08x, POSITION %08x \n\r", status1.sensors.Speed, status1.sensors.Position);
}


