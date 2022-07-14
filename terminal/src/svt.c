#include "erl_nif.h"

static ERL_NIF_TERM svt(ErlNifEnv *env, int argc, const ERL_NIF_TERM argv[]) {
  int tty;
  
  (void)argc; 

  if (!enif_get_int(env, argv[0], &tty)) {
      return enif_make_badarg(env);
  }

  return enif_make_int(env, 0);
}

static ErlNifFunc nif_funcs[] = {
  {"svt", 1, svt, 0}
};

ERL_NIF_INIT(Elixir.AthashaTerminal.SVT, nif_funcs, NULL, NULL, NULL, NULL)
