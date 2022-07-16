#P_TARGET is ALWAYS Linux (qemu on host)
#run with:
# mix compile
# mix clean

SRCDIR = src
PRVDIR = priv/native

N_SOURCES = $(SRCDIR)/tty_nif.c
N_TARGET = $(PRVDIR)/tty_nif.so
N_FLAGS = -fPIC -I$(ERTS_INCLUDE_DIR) -shared -g -O3 -pedantic -Wall -Wextra -D_XOPEN_SOURCE=600
N_LDFLAGS= -L$(SRCDIR)/termbox/src -l:termbox.a

P_TARGET = $(PRVDIR)/tty_port
P_SOURCES = $(wildcard $(SRCDIR)/*port.c)
P_CFLAGS = -fPIC -g -O3 -pedantic -Wall -Wextra -D_XOPEN_SOURCE=600
P_LDFLAGS= -L$(SRCDIR)/termbox/src -l:termbox.a

TB_SRCDIR = src/termbox/src
TB_TARGET = $(TB_SRCDIR)/termbox.a
TB_SOURCES = $(wildcard $(TB_SRCDIR)/*.c)
TB_OBJECTS = $(TB_SOURCES:.c=.o)
TB_CFLAGS = -fPIC -D_XOPEN_SOURCE

.PHONY: all clean

all: $(P_TARGET) $(N_TARGET)

$(P_TARGET): $(P_SOURCES) $(TB_TARGET)
	mkdir -p $(PRVDIR)
	$(CC) $(P_CFLAGS) $(P_SOURCES) -o $@ $(P_LDFLAGS)

%.o : %.c
	$(CC) -c $(TB_CFLAGS) $< -o $@
	
$(TB_TARGET): $(TB_OBJECTS)
	$(AR) -r -o $@ $(TB_OBJECTS)

$(N_TARGET): $(N_SOURCES) $(TB_TARGET)
	$(CC) $(N_FLAGS) $(N_SOURCES) -o $@ $(N_LDFLAGS)

clean:
	rm -f $(N_TARGET)
	rm -f $(TB_OBJECTS)
	rm -f $(TB_TARGET)
	rm -f $(P_TARGET)
