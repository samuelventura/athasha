#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <stdarg.h>
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
    int pip[2]; //0=read 1=write
    pipe(pip);
    int pop[2]; //0=read 1=write
    pipe(pop);
    if (fork()) { //parent
        close(pip[1]);
        fd_set fds;
        while (1) {
            FD_ZERO(&fds);
            FD_SET(STDIN_FILENO, &fds);
            FD_SET(pip[0], &fds);
            r = select(pip[0] + 1, &fds, 0, 0, 0);
            if (!r) continue;
            debug("pselect %d", r);
            if (r<=0) crash("select %d", r);
            if (FD_ISSET(STDIN_FILENO, &fds)) {
                int n = read(STDIN_FILENO, buf, sizeof(buf));
                if (n <= 0) crash("read STDIN_FILENO %d", n);
                int w = write(pop[1], buf, n);
                if (w!=n) crash("write pop[1] %d", w);
            }
            if (FD_ISSET(pip[0], &fds)) {
                int n = read(pip[0], buf, sizeof(buf));
                if (n <= 0) crash("read pip[0] %d", n);
                int w = write(STDOUT_FILENO, buf, n);
                if (w!=n) crash("write STDOUT_FILENO %d", w);
                debug("isatty %d", isatty(0));
            }
        }
    } else { //child
        close(pop[1]);
        // close(STDIN_FILENO);
        // close(STDOUT_FILENO);
        const char* link = "/tmp/master.pts";
        int fd = open(link, O_RDWR); //attach
        if (fd < 0) crash("open %s %d", link, fd);
        make_raw(fd);
        // r = dup2(fd, STDIN_FILENO);
        // if (r<0) crash("dup2 STDIN_FILENO", r);
        // r = dup2(fd, STDOUT_FILENO);
        // if (r<0) crash("dup2 STDOUT_FILENO", r);
        // r = setsid();
        // if (r<0) crash("setsid %d", r);
        // r = ioctl(fd, TIOCSCTTY, 1);
        // if (r<0) crash("ioctl TIOCSCTTY %d", r);
        //close(fd);
        fd_set fds;
        int max = pop[0] > fd ? pop[0] : fd;
        while (1) {
            FD_ZERO(&fds);
            FD_SET(fd, &fds);
            FD_SET(pop[0], &fds);
            r = select(max + 1, &fds, 0, 0, 0);
            debug("cselect %d", r);
            if (r<=0) crash("select %d", r);
            if (FD_ISSET(fd, &fds)) {
                debug("cselect fd");
                int n = read(fd, buf, sizeof(buf));
                if (n <= 0) crash("read fd %d", n);
                int w = write(pip[1], buf, n);
                if (w!=n) crash("write pip[1] %d", w);
            }
            if (FD_ISSET(pop[0], &fds)) {
                int n = read(pop[0], buf, sizeof(buf));
                if (n <= 0) crash("read pop[0] %d", n);
                int w = write(fd, buf, n);
                if (w!=n) crash("write fd %d", w);
            }
        }        
    }
    return 0;
}
