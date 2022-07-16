#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <stddef.h>
#include <unistd.h>
#include <fcntl.h>
#include <termios.h>
#include <pthread.h>
#include <sys/ioctl.h>
#include <linux/vt.h>
#include <linux/kd.h>
#include "termbox/src/termbox.h"
#include "port.h"

#define UNUSED(x) (void)(x)

pthread_t poll_thread;

void send_size() {
  char buf[32];
  int w = tb_width();
  int h = tb_height();
  int n = snprintf(buf, sizeof(buf), "s%08X%08X", w, h);
  debug("S: %s", buf);
  stdout_write_packet((unsigned char*)buf, n);
}

void send_event(struct tb_event *event) {
  char buf[64];
  int n = snprintf(buf, sizeof(buf), "e%02X%02X%04X%08X%08X%08X%08X%08X", 
    event->type, event->mod, event->key, event->ch, 
    event->w, event->h, event->x, event->y);
  stdout_write_packet((unsigned char*)buf, n);
}

void *poll_events( void *arg ) {
  UNUSED(arg);
  send_size();
  while(1) {
    struct tb_event event;
    tb_poll_event(&event);
    debug("E: type:%d mod:%d key:%d ch:%d w:%d h:%d x:%d y:%d",
    event.type, event.mod, event.key, event.ch, 
    event.w, event.h, event.x, event.y);
    send_event(&event);
  }
  return NULL;
}

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
  char vt[32];
  read_str_c(cmd, ';', vt, sizeof(vt));
  int fd = open(vt, O_RDWR|O_NOCTTY);
  int err = tb_init_fd(fd);
  if (err) crash("tb_init_file %d %s", err, vt);
  if (atexit(tb_shutdown)) crash("texit tb_shutdown");
  if (pthread_create(&poll_thread, NULL, poll_events, (void*) NULL)) crash("pthread_create");
}

void cmd_size(struct CMD* cmd) {
  UNUSED(cmd);
  send_size();
}

void cmd_mode(struct CMD* cmd) {
  int m = read_uint(cmd);
  tb_select_input_mode(m);
}

int c_x = -1;
int c_y = -1;

void cmd_x(struct CMD* cmd) {
  c_x = read_uint(cmd);
}

void cmd_y(struct CMD* cmd) {
  c_y = read_uint(cmd);
}

void cmd_cursor(struct CMD* cmd) {
  UNUSED(cmd);
  tb_set_cursor(c_x, c_y);
}

int process_cmd(struct CMD* cmd) {
  while(cmd->position < cmd->length) {
    char c = cmd->buffer[cmd->position++];
    switch(c) {
      case 'x':
        cmd_x(cmd);
        break;
      case 'y':
        cmd_y(cmd);
        break;
      case 'u':
        cmd_cursor(cmd);
        break;
      case 'r':
        tb_clear();
        break;
      case 'p':
        tb_present();
        break;
      case 'c':
        cmd_chvt(cmd);
        break;
      case 'o':
        cmd_openvt(cmd);
        break;
      case 's':
        cmd_size(cmd);
        break;
      case 'm':
        cmd_mode(cmd);
        break;
      default:
        crash("process_cmd %d %c", cmd->position, c);
    }
  }
  return 0;
}

int main(int argc, char *argv[]) {
  read_loop(argc, argv, process_cmd);
  exit(0); //kill threads
  return 0;
}
