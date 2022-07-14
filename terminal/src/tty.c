#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <stddef.h>
#include <unistd.h>
#include <fcntl.h>
#include <termios.h>
#include <sys/ioctl.h>
#include <linux/vt.h>
#include <linux/kd.h>
#include "termbox/src/termbox.h"
#include "port.h"

int vtfd = -1;

//from chvt.c source
void cmd_chvt(struct CMD* cmd) {
  int tn = read_digit(cmd);
  int fd = open("/dev/tty0", O_RDWR);
  if (fd < 0) crash("open /dev/tty0");
  if (ioctl(fd, VT_ACTIVATE, tn)) crash("chvt VT_ACTIVATE");
  if (ioctl(fd, VT_WAITACTIVE, tn)) crash("chvt VT_WAITACTIVE");
  close(fd);
}

void cmd_openvt(struct CMD* cmd) {
  char vt[16];
  int tn = read_digit(cmd);
  sprintf(vt, "/dev/tty%d", tn);
  tb_init_file(vt);
}

void process_cmd(struct CMD* cmd) {
  while(cmd->position < cmd->length) {
    int start = cmd->position;
    char c = cmd->buffer[cmd->position++];
    switch(c) {
      case 'c':
        cmd_chvt(cmd);
        break;
      case 'o':
        cmd_openvt(cmd);
        break;
      default:
        crash("process_cmd failed at index %d invalid cmd %c", start, c);
    }
  }
}

int main(int argc, char *argv[]) {
  return read_loop(argc, argv, process_cmd);
}
