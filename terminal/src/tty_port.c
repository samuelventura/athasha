#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <stddef.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <termios.h>
#include <signal.h>
#include <pthread.h>
#include <sys/ioctl.h>
#include <sys/select.h>
#include <sys/types.h>
#include <sys/stat.h>
#ifdef __linux__
#include <linux/vt.h>
#include <linux/kd.h>
#endif
#include "port.h"

#define UNUSED(x) (void)(x)

int rp[2];
int fd;

static void signal_handler(int sig) {
  switch(sig) {
    case SIGWINCH:
    if (write(rp[1], &sig, 1)<=0) crash("SIGWINCH write");
    break;
  }
}

static void signal_setup(int sig) {
  struct sigaction sa;
	memset(&sa, 0, sizeof(sa));
	sa.sa_handler = signal_handler;
	sa.sa_flags = 0;
	sigaction(sig, &sa, 0); 
}

void cmd_chvt(struct CMD* cmd) {
#ifdef __linux__
  int tn = read_digit(cmd);
  int fd = open("/dev/tty0", O_RDWR);
  if (fd < 0) crash("open /dev/tty0");
  if (ioctl(fd, VT_ACTIVATE, tn)) crash("chvt VT_ACTIVATE");
  if (ioctl(fd, VT_WAITACTIVE, tn)) crash("chvt VT_WAITACTIVE");
  close(fd);
#else
  UNUSED(cmd);
#endif
}

void make_raw() {
  struct termios ts;
  tcgetattr(fd, &ts);
  ts.c_iflag &= ~(IGNBRK | BRKINT | PARMRK | ISTRIP
                  | INLCR | IGNCR | ICRNL | IXON);
  ts.c_oflag &= ~OPOST;
  ts.c_lflag &= ~(ECHO | ECHONL | ICANON | ISIG | IEXTEN);
  ts.c_cflag &= ~(CSIZE | PARENB);
  ts.c_cflag |= CS8;
  tcsetattr(fd, TCSAFLUSH, &ts);
}

void send_size() {
  char buf[256];
  struct winsize ts;
  ioctl(fd, TIOCGWINSZ, &ts);
  int n = snprintf(buf, sizeof(buf), "\x1B[%d,%dR", ts.ws_row, ts.ws_col);
  stdout_write_packet((unsigned char*)buf, n);
}

void cmd_openvt(struct CMD* cmd) {
  char vt[32];
  read_str_c(cmd, ';', vt, sizeof(vt));
  fd = open(vt, O_RDWR|O_NOCTTY);
  if (pipe(rp)) crash("pipe");
  make_raw();
  send_size();
  signal_setup(SIGWINCH);
  ioctl(fd, TIOCSCTTY, 1);
  char buf[0x10000];
  int max = rp[0] > fd ? rp[0] : fd;
  fd_set fds;
  while (1) {
    FD_ZERO(&fds);
    FD_SET(fd, &fds);
    FD_SET(rp[0], &fds);
    FD_SET(STDIN_FILENO, &fds);
    int r = select(max + 1, &fds, 0, 0, 0);
    if (r<=0) continue; //-1 on resize signal
    if (FD_ISSET(fd, &fds)) {
      int n = read(fd, buf, sizeof(buf));
      if (n <= 0) crash("read fd %d", n);
      stdout_write_packet((unsigned char*)buf, n);
    }
    if (FD_ISSET(STDIN_FILENO, &fds)) {
      int n = stdin_read_packet((unsigned char*)buf, sizeof(buf));
      if (n <= 0) crash("read STDIN_FILENO %d", n);
      int w = write(fd, buf, n);
      if (w!=n) crash("write fd %d", w);
    }
    if (FD_ISSET(rp[0], &fds)) {
      int n = read(rp[0], buf, sizeof(buf));
      if (n <= 0) crash("read rp[0] %d", n);
      send_size();
    }
  }
}

int process_cmd(struct CMD* cmd) {
  while(cmd->position < cmd->length) {
    char c = cmd->buffer[cmd->position++];
    switch(c) {
      case 'c':
        cmd_chvt(cmd);
        break;
      case 'o':
        cmd_openvt(cmd);
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
