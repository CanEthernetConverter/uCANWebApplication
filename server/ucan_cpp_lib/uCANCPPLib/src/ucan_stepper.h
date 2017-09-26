#ifndef UCAN_STEPPER_H
#define UCAN_STEPPER_H

#include "ucan_common.h"
#include <chrono>
#include <deque>
#include <memory>
#include <sstream>
#include <string>

// command set for stepper motor
class ucan_stepper : public common_ucan_cmd {
public:
  enum name {
    rotate_anti_clockwhise = 0,
    rotate_clockwhise,

  };

  typedef enum {
    micro0 = 0,
    micro2 = 1,
    micro4 = 2,
    micro8 = 3,
    micro16 = 4,
    micro32 = 5
  } tMicrostepsCount;

  static const int driver_id = MOTOR_DRIVER_ID_STEPPER;
  static const int command_id = STEPPER_STEP_CMD__ID;
  static const int status_frame_id = MOTOR_CONTROL_FRAME_ID;

  typedef struct tCANStepperCMD1 {
    union {
      struct {
        union {
          struct {
            uint32_t stepSize : 8;
            uint32_t dir : 8;
            uint32_t unused : 16;
          };
          uint32_t byte;
        } flags;
        uint32_t stepCount;
      };
      uint8_t data[8];
    };
  } CANStepperCMD1;

  typedef struct tCANStatusFrame1 {
    union {
      struct {
        union {
          struct {
            uint16_t Speed;
            uint16_t Position;
          };
          uint32_t whole;
        } sensors;

        union {
          struct {
            uint32_t nowStepping : 1;
            uint32_t StepCount : 31;
          };
          uint32_t whole;
        } stepper;
      };
      uint8_t data[8];
    };
  } CANStatusFrame1;


  ucan_stepper(CANStepperCMD1 command, std::chrono::milliseconds _timeout,
               int _count)
      : CMD1Data(command), common_ucan_cmd(_timeout, _count) {}

  Iucan_sendable send() {
    can_frame c;
    c.can_dlc = sizeof(CMD1Data.data);
    memcpy(c.data, CMD1Data.data, c.can_dlc);
    return Iucan_sendable(c, this->timeout, this->count);
  }

  std::string toString() {
    std::ostringstream st;
    for (int i = 0; i < sizeof(CMD1Data.data); ++i) {
      auto tmp = CMD1Data.data[i];
      st << std::setfill('0') << std::setw(2) << std::hex << (int)tmp;
    }
    return st.str();
  }

private:

  CANStepperCMD1 CMD1Data;  
};

#endif // UCAN_STEPPER_H
