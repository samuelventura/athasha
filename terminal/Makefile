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

S_TARGET = $(PRVDIR)/tty_slave
S_SOURCES = $(SRCDIR)/tty_slave.c
S_CFLAGS = $(C_CFLAGS)
S_LDFLAGS= $(C_LDFLAGS)

M_TARGET = $(PRVDIR)/tty_master
M_SOURCES = $(SRCDIR)/tty_master.c
M_CFLAGS = $(C_CFLAGS)
M_LDFLAGS= $(C_LDFLAGS)

ifeq ($(MIX_TARGET),host)
ifeq ($(UNAME),Darwin)
S_CFLAGS += -D_DARWIN_C_SOURCE
M_CFLAGS += -D_DARWIN_C_SOURCE
N_CFLAGS += -D_DARWIN_C_SOURCE
P_CFLAGS += -D_DARWIN_C_SOURCE
N_LDFLAGS += -dynamiclib -undefined dynamic_lookup
endif
endif

.PHONY: all clean

all: $(P_TARGET) $(N_TARGET) $(S_TARGET) $(M_TARGET)

$(PRVDIR):
	mkdir -p $(PRVDIR)

$(S_TARGET): $(PRVDIR) $(S_SOURCES) 
	$(CC) $(S_CFLAGS) $(S_SOURCES) -o $@ $(S_LDFLAGS)

$(M_TARGET): $(PRVDIR) $(M_SOURCES) 
	$(CC) $(M_CFLAGS) $(M_SOURCES) -o $@ $(M_LDFLAGS)

$(P_TARGET): $(PRVDIR) $(P_SOURCES) 
	$(CC) $(P_CFLAGS) $(P_SOURCES) -o $@ $(P_LDFLAGS)
	
$(N_TARGET): $(PRVDIR) $(N_SOURCES) 
	$(CC) $(N_CFLAGS) $(N_SOURCES) -o $@ $(N_LDFLAGS)

clean:
	rm -f $(N_TARGET)
	rm -f $(P_TARGET)
	rm -f $(S_TARGET)
	rm -f $(M_TARGET)
