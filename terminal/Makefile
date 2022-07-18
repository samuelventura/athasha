# https://hexdocs.pm/nerves/environment-variables.html
# run with:
#  mix compile
#  mix clean

SRCDIR = src
PRVDIR = priv/native
UNAME := $(shell uname -s)
MIX_TARGET ?= host

C_CFLAGS = -g -O3 -pedantic -Wall -Wextra -D_XOPEN_SOURCE=700
C_LDFLAGS = -fPIC

N_SOURCES = $(SRCDIR)/tty_nif.c
N_TARGET = $(PRVDIR)/tty_nif.so
N_CFLAGS = $(C_CFLAGS) -I$(ERTS_INCLUDE_DIR)
N_LDFLAGS= $(C_LDFLAGS) -shared -L$(ERL_EI_LIBDIR)

P_TARGET = $(PRVDIR)/tty_port
P_SOURCES = $(wildcard $(SRCDIR)/*port.c)
P_CFLAGS = $(C_CFLAGS)
P_LDFLAGS= $(C_LDFLAGS)

ifeq ($(MIX_TARGET),host)
ifeq ($(UNAME),Darwin)
N_CFLAGS += -D_DARWIN_C_SOURCE
P_CFLAGS += -D_DARWIN_C_SOURCE
N_LDFLAGS += -dynamiclib -undefined dynamic_lookup
endif
endif

.PHONY: all clean

all: $(P_TARGET) $(N_TARGET)

$(PRVDIR):
	mkdir -p $(PRVDIR)

$(P_TARGET): $(PRVDIR) $(P_SOURCES) 
	$(CC) $(P_CFLAGS) $(P_SOURCES) -o $@ $(P_LDFLAGS)
	
$(N_TARGET): $(PRVDIR) $(N_SOURCES) 
	$(CC) $(N_CFLAGS) $(N_SOURCES) -o $@ $(N_LDFLAGS)

clean:
	rm -f $(N_TARGET)
	rm -f $(P_TARGET)
