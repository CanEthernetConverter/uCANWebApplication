#ifndef UCAN_NET_H
#define UCAN_NET_H

#include <stdint.h>
#include <string>
#include <stdlib.h>
#include <sstream>
#include <iostream>
#include <iomanip>


typedef union {
  struct {
    uint32_t frame_type : 8; // [0-254] frame type, type specific
    uint32_t type : 8;       //[0 - 254] device type
    uint32_t id : 8; // [0-254] unique device id in network for this device type
    uint32_t mcast : 1; // [0-1] multicast frame for sending one frames to all
                        // devices of the same type in group
    uint32_t group : 3; // [0-8] group number
    uint32_t unused : 1;
  };
  uint32_t whole; // 29bits extended

public:
  std::string toString() {
    std::ostringstream st;
    for (int i = 0; i < sizeof(this->whole); ++i) {
      auto tmp = ((uint8_t *)&this->whole)[i];
      st << std::setfill('0') << std::setw(2) << std::hex << (int)tmp;
    }
    return st.str();
  }

  uint32_t get_whole(){return this->whole;}

} uCANnetID;

#include <string>

#endif // UCAN_NET_H
