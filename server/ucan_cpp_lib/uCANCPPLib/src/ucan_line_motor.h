#ifndef UCAN_LINE_MOTOR_H
#define UCAN_LINE_MOTOR_H

#include "ucan_common.h"

class ucan_line_motor : public common_ucan_cmd {
public:
  enum name {
    rotate_anti_clockwhise = 0,
    rotate_clockwhise,
    motor_break,
  };

  static const int status_frame_id = MOTOR_CONTROL_FRAME_ID;

  typedef struct tCANBrushCMD1 {
    union {
      struct {
        struct {
          uint32_t pwm : 16;
          uint32_t breakingOn : 1;
          uint32_t dir : 1;
          uint32_t speedControl : 1;
          uint32_t positionControl : 1;
          uint32_t unused : 12;
        } directControl;
        struct {
          uint16_t position;
          uint16_t speed;
        } regulatorControl;
      };
      uint8_t data[8];
    };
  } CANBrushedCMD1;

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
            uint32_t state : 3; // running, braking
            uint32_t dir : 1;
            uint32_t pwmValue : 16;
          };
          uint32_t whole;
        } brushed;
      };
      uint8_t data[8];
    };
  } CANStatusFrame1;

  static const int driver_id = MOTOR_DRIVER_ID_LINE;
  static const int command_id = STEPPER_STEP_CMD__ID;

  ucan_line_motor(CANBrushedCMD1 _command, std::chrono::milliseconds _timeout,
                  int _count)
      : CMD1Data(_command), common_ucan_cmd(_timeout, _count) {}

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
  CANBrushedCMD1 CMD1Data;


};

#endif // UCAN_LINE_MOTOR_H
