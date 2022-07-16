#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <stdarg.h>
#include <termios.h>
#include <sys/select.h>
#include <sys/types.h>
#include <sys/stat.h>

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

void cfmakeraw(struct termios *ts) {
    ts->c_iflag &= ~(IGNBRK | BRKINT | PARMRK | ISTRIP
                    | INLCR | IGNCR | ICRNL | IXON);
    ts->c_oflag &= ~OPOST;
    ts->c_lflag &= ~(ECHO | ECHONL | ICANON | ISIG | IEXTEN);
    ts->c_cflag &= ~(CSIZE | PARENB);
    ts->c_cflag |= CS8;
}

void make_raw(int fd) 
{
    int r;
    struct termios ts;
    r = tcgetattr(fd, &ts);
    if (r) crash("tcgetattr %d", fd);
    cfmakeraw(&ts);
    r = tcsetattr (fd, TCSANOW, &ts);
    if (r) crash("tcsetattr %d", fd);    
}

int main (void)
{
    int r;
    char buf[256];
    const char* fifo = "/tmp/master.fifo";
    const char* link = "/tmp/master.pts";
    int fd = posix_openpt(O_RDWR|O_NOCTTY);
    if (fd < 0) crash("posix_openpt %d", fd);
    r = unlockpt(fd);
    if (r) crash("unlockpt %d %d", fd, r);
    r = grantpt(fd);
    if (r) crash("grantpt %d %d", fd, r);
    char* slave = ptsname(fd);
    unlink(link);
    r = symlink(slave, link);
    if (r) crash("symlink %s %d", slave, r);
    fd_set fds;
    FD_ZERO(&fds);
    FD_SET(0, &fds);
    FD_SET(fd, &fds);
    //make_raw(0);
    make_raw(fd);
    while (1) {
        r = select(fd + 1, &fds, 0, 0, 0);
        debug("select %d", r);
        if (r<=0) crash("select %d", r);
        if (FD_ISSET(0, &fds)) {
            int n = read(0, buf, sizeof(buf));
            if (n <= 0) crash("read 0 %d", n);
            int w = write(fd, buf, n);
            if (w!=n) crash("write fd %d", w);
        }
        if (FD_ISSET(fd, &fds)) {
            int n = read(fd, buf, sizeof(buf));
            if (n <= 0) crash("read fd %d", n);
            int w = write(1, buf, n);
            if (w!=n) crash("write 1 %d", w);
        }
    }
    return 0;
}
