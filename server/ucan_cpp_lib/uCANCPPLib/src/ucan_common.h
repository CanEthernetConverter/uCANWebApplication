#ifndef UCAN_COMMON_H
#define UCAN_COMMON_H

#include "ucan_net.h"
#include "ucan_commands_manager.h"
#include <chrono>
#include <deque>
#include <string>
#include <linux/can.h>
// ------------ device types ------------------

#define MOTOR_DRIVER_ID_STEPPER 5
#define MOTOR_DRIVER_ID_LINE 6

// ----------------- frames types ------------------
#define MOTOR_CONTROL_FRAME_ID 13
#define STEPPER_STEP_CMD__ID 64


class common_ucan_cmd {
public:
  Iucan_sendable send();
  std::string toString();
  common_ucan_cmd(std::chrono::milliseconds _timeout, int _count)
      : count(_count), timeout(_timeout) {}

protected:
  can_frame frame;
  int count;
  std::chrono::milliseconds timeout;
};

template <class T> class ucan_device{
public:
    ucan_device(int device_id) {
        ucan_net_id.whole = 0;
        ucan_net_id.frame_type = T::command_id;
        ucan_net_id.type = T::driver_id;
        ucan_net_id.id = device_id;
    }
  void execute() {
      this->mngr.start(this->command_queue, this->ucan_net_id);
  }

  void recive_frame(void (*callback_function)(can_frame *buffer), uint8_t _ucan_net_type){

      uCANnetID d_id = this->get_id();
      d_id.frame_type = _ucan_net_type;
      this->mngr.start_rx(d_id, callback_function);
  }

  uCANnetID get_id() { return ucan_net_id; }
  void add(T command) {
    this->command_queue.push_back(command);
  }
  T get_command_in_queue(int i) { return command_queue[i]; }

private:
  uCANnetID ucan_net_id;
  std::deque<T> command_queue;
  ucan_commands_manager<T> mngr;
};

#endif // UCAN_COMMON_H

