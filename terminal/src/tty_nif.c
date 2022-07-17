#include "erl_nif.h"
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/select.h>
#include <sys/ioctl.h>
#include <signal.h>
#include <termios.h>
#include <string.h>

#define UNUSED(x) (void)(x)

int fd;

static void signal_handler(int sig) {
  struct winsize ts;
  switch(sig) {
    case SIGWINCH:
    ioctl(0, TIOCGWINSZ, &ts);
    ioctl(fd, TIOCSWINSZ, &ts);
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

static ERL_NIF_TERM nif_openpt(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  UNUSED(argv);
  fd = posix_openpt(O_RDWR|O_NOCTTY);
  unlockpt(fd);
  signal_handler(SIGWINCH);
	signal_setup(SIGWINCH);  
  return enif_make_string(env, ptsname(fd), ERL_NIF_LATIN1);
}

void make_raw(int fd, struct termios *ots) {
    tcgetattr(fd, ots);
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

static ERL_NIF_TERM nif_linkpt(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  int ff;
  char buf[256];
  enif_get_string(env, argv[0], buf, sizeof(buf), ERL_NIF_LATIN1);  
  mkfifo(buf, 0666);
  ff = open(buf, O_RDWR);
  fd_set fds;
  int max = ff > fd ? ff : fd;
  struct termios ots;
  make_raw(0, &ots);
  while (1) {
    FD_ZERO(&fds);
    FD_SET(0, &fds);
    FD_SET(fd, &fds);
    FD_SET(ff, &fds);
    int r = select(max + 1, &fds, 0, 0, 0);
    if (r<=0) break;
    if (FD_ISSET(0, &fds)) {
      int n = read(0, buf, sizeof(buf));
      if (n <= 0) break;
      if (write(fd, buf, n)!=n) break;
    }
    if (FD_ISSET(fd, &fds)) {
      int n = read(fd, buf, sizeof(buf));
      if (n <= 0) break;
      if (write(1, buf, n)!=n) break;
    }
    if (FD_ISSET(ff, &fds)) break;
  }
  tcsetattr(0, TCSAFLUSH, &ots);
  return enif_make_atom(env, "ok");
}

static ErlNifFunc nif_funcs[] = {
  {"openpt", 0, nif_openpt, 0},
  {"linkpt", 1, nif_linkpt, 0},
};

ERL_NIF_INIT(Elixir.AthashaTerminal.Tty, nif_funcs, NULL, NULL, NULL, NULL)
