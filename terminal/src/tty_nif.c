#include "erl_nif.h"
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/select.h>
#include "termbox/src/termbox.h"

#define UNUSED(x) (void)(x)

static ERL_NIF_TERM nif_tbinit(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  UNUSED(argv);
  int r = tb_init();
  return enif_make_int(env, r);
}

static ERL_NIF_TERM nif_tbexit(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  UNUSED(argv);
  tb_shutdown();
  return enif_make_atom(env, "ok");
}

static ERL_NIF_TERM nif_ttyname(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  UNUSED(argv);
  return enif_make_string(env, ttyname(0), ERL_NIF_LATIN1);
}

static ERL_NIF_TERM nif_openpt(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  UNUSED(argv);
  int fd = posix_openpt(O_RDWR|O_NOCTTY);
  unlockpt(fd);
  return enif_make_int(env, fd);
}

static ERL_NIF_TERM nif_ptsname(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  int fd;
  enif_get_int(env, argv[0], &fd);  
  return enif_make_string(env, ptsname(fd), ERL_NIF_LATIN1);
}

static ERL_NIF_TERM nif_linkpt(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  UNUSED(argc);
  int fd;
  int ff;
  char buf[256];
  enif_get_int(env, argv[0], &fd);  
  enif_get_string(env, argv[1], buf, sizeof(buf), ERL_NIF_LATIN1);  
  mkfifo(buf, 0666);
  ff = open(buf, O_RDWR);
  fcntl(0, O_NONBLOCK);
  fcntl(fd, O_NONBLOCK);
  fcntl(ff, O_NONBLOCK);
  fd_set fds;
  FD_ZERO(&fds);
  FD_SET(0, &fds);
  FD_SET(fd, &fds);
  FD_SET(ff, &fds);
  int max = ff > fd ? ff : fd;
  while (1) {
    int r = select(max + 1, &fds, 0, 0, 0);
    printf("select %d\n", r);
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
  return enif_make_atom(env, "ok");
}

static ErlNifFunc nif_funcs[] = {
  {"tbinit", 0, nif_tbinit, 0},
  {"tbexit", 0, nif_tbexit, 0},
  {"ttyname", 0, nif_ttyname, 0},
  {"openpt", 0, nif_openpt, 0},
  {"ptsname", 1, nif_ptsname, 0},
  {"linkpt", 2, nif_linkpt, 0},
};

ERL_NIF_INIT(Elixir.AthashaTerminal.Tty, nif_funcs, NULL, NULL, NULL, NULL)
