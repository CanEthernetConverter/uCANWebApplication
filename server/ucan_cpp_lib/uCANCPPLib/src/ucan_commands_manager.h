#ifndef UCAN_COMMANDS_MANAGER_H
#define UCAN_COMMANDS_MANAGER_H

#include "ucan_can_interface.h"
#include "ucan_common.h"
#include <chrono>
#include <deque>
#include <iostream>
#include <linux/can.h>
#include <string>
#include <thread>

using namespace std::chrono_literals;

class Iucan_sendable {
public:
  Iucan_sendable(can_frame _data, std::chrono::milliseconds _timeout,
                 int _repeat_count)
      : data(_data), timeout(_timeout), repeat_count(_repeat_count) {}

  std::string toString() {
    std::ostringstream st;
    for (int i = 0; i < sizeof(data.can_dlc); ++i) {
      auto tmp = data.data[i];
      st << std::setfill('0') << std::setw(2) << std::hex << (int)tmp;
    }
    return st.str();
  }

  std::chrono::milliseconds get_timeout() { return timeout; }
  bool command_expired() {
    if (repeat_count > 0) {
      repeat_count--;
    }
    if (repeat_count == 0)
      return true;
    return false;
  }

  can_frame get_can_frame() { return data; }

private:
  can_frame data;
  std::chrono::milliseconds timeout;
  int repeat_count;
};

template <class T> class ucan_commands_manager {
private:
  uCANnetID device_id;
  std::thread send_thread;
  std::thread rx_thread;
  bool rx_stop;
  static void manage_commands(uCANnetID device_id,
                              std::deque<Iucan_sendable> command_queue);
  static void rx_data(uCANnetID device_id, void (*callback_function)(can_frame *buffer),bool *stop);

public:
  ucan_commands_manager() {
  }
  void start_rx(uCANnetID _id, void (*callback_function)(can_frame *buffer)){
      rx_stop = false;
      std::thread t2(ucan_commands_manager::rx_data, _id, callback_function, &(this->rx_stop));
      rx_thread = std::move(t2);
  }

  void start(std::deque<T> t_command, uCANnetID _device_id);
  void stop() {

    if (this->send_thread
            .joinable()) // wait for thread to finish befone making new one
    {
      this->send_thread.join();
    }
    if (this->rx_thread
            .joinable()) // wait for thread to finish befone making new one
    {
      rx_stop = true;
      this->rx_thread.join();
    }
  }

  ~ucan_commands_manager() {
      this->stop();
  }
  ucan_commands_manager(ucan_commands_manager &&) = default;
};

template <class T>
void ucan_commands_manager<T>::start(std::deque<T> t_command,
                                     uCANnetID _device_id) {

  this->device_id = _device_id;
  //  BOOST_LOG_TRIVIAL(trace) << "ucan_command_manager execute " << std::hex
  //                           << (int)this->device_id.id;

  // stop previouse thread before making new one
  this->stop();

  // generate queue for manager
  std::deque<Iucan_sendable> command_queue;
  for (T i : t_command) {
    command_queue.push_back(i.send());
  }
  // start sending thread
  std::thread t(ucan_commands_manager::manage_commands, this->device_id,
                command_queue);

  send_thread = std::move(t);
}

template <class T>
void ucan_commands_manager<T>::rx_data(
    uCANnetID device_id, void (*callback_function)(can_frame *buffer),bool *stop)
{
     can_frame buffer;
     ucan_can_interface can_sock = ucan_can_interface(ucan_can_interface::interface_name);
     can_sock.set_filter(device_id.whole,CAN_EFF_MASK);
     while (1)
     {
        if (*stop){
//            printf("stop");
            break;
        }
//        printf("w");
        if (can_sock.can_rx(&buffer) == 1)
        {
//            printf("r");
            callback_function(&buffer);
        }
        std::this_thread::sleep_for(10ms);
     }
}

template <class T>
void ucan_commands_manager<T>::manage_commands(
    uCANnetID device_id, std::deque<Iucan_sendable> command_queue) {

  ucan_can_interface can_sock = ucan_can_interface(ucan_can_interface::interface_name);
  while (command_queue.size() > 0) {

    auto f = command_queue[0];
    if (command_queue[0].command_expired()) {
      command_queue.pop_front();
    }

    std::this_thread::sleep_for(f.get_timeout());

    can_frame frame = f.get_can_frame();
    frame.can_id = device_id.get_whole();

    can_sock.can_send(frame);
    //    BOOST_LOG_TRIVIAL(trace) << device_id.toString() << ":" <<
    //    f.toString();
  }
}

#endif // UCAN_COMMANDS_MANAGER_H
