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

pthread_mutex_t stdout_mutex;
pthread_t poll_thread;
int init = -1;

void lock_mutex() {
  if (init != 0) return;
  if(pthread_mutex_lock(&stdout_mutex)) 
    crash("pthread_mutex_lock");
}

void unlock_mutex() {
  if (init != 0) return;
  if(pthread_mutex_unlock(&stdout_mutex)) 
    crash("pthread_mutex_unlock");
}

void write_packet(unsigned char* buffer, int size) {
  lock_mutex();
  stdout_write_packet(buffer, size);
  unlock_mutex();
}

void *poll_events( void *arg ) {
  UNUSED(arg);

  while(1) {
    struct tb_event event;
    tb_poll_event(&event);
    lock_mutex();
    debug("E: type:%d mod:%d key:%d ch:%d w:%d h:%d x:%d y:%d",
    event.type, event.mod, event.key, event.ch, 
    event.w, event.h, event.x, event.y);
    unlock_mutex();
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

void cmd_openvt(struct CMD* cmd, int name) {
  char vt[32];
  if (name) {
    read_str_c(cmd, ';', vt, 30);
  } else {
    int tn = read_digit(cmd);
    if (tn>0) sprintf(vt, "/dev/tty%d", tn);
    else sprintf(vt, "/dev/tty");
  }
  init = tb_init_file(vt);
  if (init) crash("tb_init_file %d %s", init, vt);
  if (pthread_mutex_init(&stdout_mutex, NULL)) crash("pthread_mutex_init");
  if (pthread_create(&poll_thread, NULL, poll_events, (void*) NULL)) crash("pthread_create");
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
        cmd_openvt(cmd, 0);
        break;
      case 'O':
        cmd_openvt(cmd, 1);
        break;
      default:
        crash("process_cmd failed at index %d invalid cmd %c", start, c);
    }
  }
}

int main(int argc, char *argv[]) {
  return read_loop(argc, argv, process_cmd);
}
