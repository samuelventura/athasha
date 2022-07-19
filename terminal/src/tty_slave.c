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
#include <stdarg.h>
#include <sys/ioctl.h>
#include <sys/select.h>
#include <sys/types.h>
#include <sys/stat.h>
#include "port.h"

#define UNUSED(x) (void)(x)
#define MAX(x, y) (x>y?x:y)
#define MAX3(x, y, z) (x>y?MAX(x,z):MAX(y,z))

void crash(const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);
  fprintf(stderr, "crash: ");
  vfprintf(stderr, fmt, ap);
  fprintf(stderr, "\r\n");
  fprintf(stderr, "error: %d %s", errno, strerror(errno));
  fprintf(stderr, "\r\n");
  fflush(stderr);
  exit(-1);
  abort();
}

int fd;
int pfd;

static void signal_handler(int sig) {
  switch(sig) {
    case SIGWINCH:
    if (write(pfd, &sig, 1)<=0) crash("SIGWINCH write");
    break;
  }
}

static void signal_setup(int sig) {
  struct sigaction sa;
	memset(&sa, 0, sizeof(sa));
	sa.sa_handler = signal_handler;
	sa.sa_flags = 0;
	if (sigaction(sig, &sa, 0)) crash("sigaction %d", sig);
}

void make_raw() {
  struct termios ts;
  if (tcgetattr(fd, &ts)) crash("tcgetattr %d", fd);
  ts.c_iflag &= ~(IGNBRK | BRKINT | PARMRK | ISTRIP
                  | INLCR | IGNCR | ICRNL | IXON);
  ts.c_oflag &= ~OPOST;
  ts.c_lflag &= ~(ECHO | ECHONL | ICANON | ISIG | IEXTEN);
  ts.c_cflag &= ~(CSIZE | PARENB);
  ts.c_cflag |= CS8;
  if (tcsetattr(fd, TCSAFLUSH, &ts)) crash("tcsetattr %d", fd);
}

void send_size() {
  struct winsize ts;
  if (ioctl(fd, TIOCGWINSZ, &ts)) crash("ioctl TIOCGWINSZ %d", fd);
  dprintf(STDOUT_FILENO, "\x1B[%d,%dR", ts.ws_row, ts.ws_col);
}

int main(int argc, char *argv[]) {
  int rp[2];
  char buf[256];
  fd_set fds;
  if (argc < 2) crash("argc %d", argc);
  int fd = open(argv[1], O_RDWR|O_NOCTTY);
  if (fd<0) crash("open %d", fd);
  if (pipe(rp)) crash("pipe");
  pfd = rp[1];
  make_raw();
  send_size();
  signal_setup(SIGWINCH);
  if(ioctl(fd, TIOCSCTTY, 1)) crash("ioctl TIOCSCTTY %d", fd);
  int max = MAX3(rp[0], fd, STDIN_FILENO);
  while (1) {
    FD_ZERO(&fds);
    FD_SET(fd, &fds);
    FD_SET(rp[0], &fds);
    FD_SET(STDIN_FILENO, &fds);
    int r = select(max + 1, &fds, 0, 0, 0);
    if (r <= 0) continue; //-1 on resize signal
    if (FD_ISSET(fd, &fds)) {
      int n = read(fd, buf, sizeof(buf));
      if (n <= 0) crash("read fd %d", n);
      int w = write(STDOUT_FILENO, (unsigned char*)buf, n);
      if (w != n) crash("write STDOUT_FILENO %d!=%d", w, n);
    }
    if (FD_ISSET(STDIN_FILENO, &fds)) {
      int n = read(STDIN_FILENO, (unsigned char*)buf, sizeof(buf));
      if (n <= 0) crash("read STDIN_FILENO %d", n);
      int w = write(fd, buf, n);
      if (w != n) crash("write fd %d", w);
    }
    if (FD_ISSET(rp[0], &fds)) {
      int n = read(rp[0], buf, sizeof(buf));
      if (n <= 0) crash("read rp[0] %d", n);
      send_size();
    }
  }
  return 0;
}
