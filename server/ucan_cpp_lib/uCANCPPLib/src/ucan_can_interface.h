#ifndef UCAN_CAN_INTERFACE_H
#define UCAN_CAN_INTERFACE_H

#include <fcntl.h>
#include <linux/can.h>
#include <linux/can/raw.h>
#include <mutex>
#include <net/if.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>


#include "ucan_commands_manager.h"

class ucan_can_interface {

private:
  int interface_id;
  std::unique_ptr<std::mutex> socket_mutex; // protects socket write

public:

  static char *interface_name;
  static void set_interface_name(const char * interface)
  {
      if (ucan_can_interface::interface_name != nullptr)
        free(ucan_can_interface::interface_name);
      ucan_can_interface::interface_name = (char*)calloc(strlen(interface),sizeof(*interface));
      memcpy(ucan_can_interface ::interface_name, interface, strlen(interface));
  }

  const char* get_interface_name()
  {
      return ucan_can_interface::interface_name;
  }

  ucan_can_interface(ucan_can_interface &&) = default;
  ~ucan_can_interface() { close(interface_id); }

  ucan_can_interface(const char *ifname) {

    socket_mutex = std::make_unique<std::mutex>();

    struct sockaddr_can addr;
    struct ifreq ifr;

    if ((interface_id = socket(PF_CAN, SOCK_RAW, CAN_RAW)) < 0) {
      printf("Error while opening socket");
      return;
    }

      strcpy(ifr.ifr_name, ifname);
      ioctl(interface_id, SIOCGIFINDEX, &ifr);

      addr.can_family = AF_CAN;
      addr.can_ifindex = ifr.ifr_ifindex;

//      printf("%s at index %d\n\r", ifname, ifr.ifr_ifindex);

      if (bind(interface_id, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        printf("Error in socket bind");
        return;
      }
    }


  uint8_t can_rx(can_frame *frame_rd) {

    int recvbytes = 0;
    struct timeval timeout = {1, 0};
    fd_set readSet;
    FD_ZERO(&readSet);
    FD_SET(interface_id, &readSet);

    if (select((interface_id + 1), &readSet, NULL, NULL, &timeout) >= 0) {
      if (FD_ISSET(interface_id, &readSet)) {
        recvbytes = read(interface_id, frame_rd, sizeof(struct can_frame));
        if (recvbytes) {
          return 1;
        }
      }
    }
    return -1;
  }

  void set_filter(canid_t id, canid_t mask) {
    // Add new filter on can-id 0x123
    struct can_filter rfilter[1];
    //   rfilter[0].can_id   = 0x80000123;
    rfilter[0].can_id = id;
    rfilter[0].can_mask = mask;
    setsockopt(interface_id, SOL_CAN_RAW, CAN_RAW_FILTER, &rfilter,
               sizeof(rfilter));
  }

  void can_send(can_frame frame) {
    int nbytes;
    frame.can_id |= CAN_EFF_FLAG;
    socket_mutex.get()->lock();
    nbytes = write(interface_id, &frame, sizeof(struct can_frame));
    //    printf("Wrote %d bytes\n", nbytes);
    //    return nbytes;
    socket_mutex.get()->unlock();
  }
};

char *ucan_can_interface::interface_name = nullptr;

#endif // UCAN_CAN_INTERFACE_H
