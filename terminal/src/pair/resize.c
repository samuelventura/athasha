#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <stdarg.h>
#include <signal.h>
#include <sys/select.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#define __USE_BSD
#include <termios.h>

void debug(const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);
  vfprintf(stderr, fmt, ap);
  fprintf(stderr, "\r\n");
  fflush(stderr);
}

int count;
struct winsize ts;

static void update_size(int sig) {
  ioctl(0, TIOCGWINSZ, &ts);
  count++;
}

int main (void)
{
  int c = count;
  signal(SIGWINCH, update_size);
  while(1) {
    pause();
    debug("SIGWINCH %d %d\n", ts.ws_row, ts.ws_col);
    signal(SIGWINCH, update_size);
  }
  return 0;
}
