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

void crash(const char* fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    vfprintf(stderr, fmt, ap);
    fprintf(stderr, "\r\n");
    fprintf(stderr, "%d %s", errno, strerror(errno));
    fprintf(stderr, "\r\n");
    fflush(stderr);
    exit(-1);
    abort(); //force crash
}

void debug(const char* fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    vfprintf(stderr, fmt, ap);
    fprintf(stderr, "\r\n");
    fflush(stderr);
}

static void update_size(int sig) {
  struct winsize ts;
  ioctl(0, TIOCGWINSZ, &ts);
  debug("SIGWINCH %d %d\n", ts.ws_row, ts.ws_col);
}

int main (void)
{
    signal(SIGWINCH, update_size);    
    struct timeval tv;
    tv.tv_sec = 1;
    tv.tv_usec = 0;
    int r;
    char buf[256];
    fd_set fds;
    while (1) {
        FD_ZERO(&fds);
        FD_SET(STDIN_FILENO, &fds);
        r = select(STDIN_FILENO + 1, &fds, 0, 0, &tv);
        if (!r) continue;
        debug("select %d", r);
        if (r<=0) crash("select %d", r);
        if (FD_ISSET(STDIN_FILENO, &fds)) {
            int n = read(STDIN_FILENO, buf, sizeof(buf));
            if (n <= 0) crash("read STDIN_FILENO %d", n);
            int w = write(STDOUT_FILENO, buf, n);
            if (w!=n) crash("write STDOUT_FILENO %d", w);
        }
    }
    return 0;
}
