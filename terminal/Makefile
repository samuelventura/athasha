#P_TARGET is ALWAYS Linux (qemu on host)
#run with:
# mix compile
# mix clean

SRCDIR = src
PRVDIR = priv/native

N_SOURCES = $(SRCDIR)/tty_nif.c
N_TARGET = $(PRVDIR)/tty_nif.so
N_FLAGS = -fPIC -I$(ERTS_INCLUDE_DIR) -shared -g -O3 -pedantic -Wall -Wextra -D_XOPEN_SOURCE=700
N_LDFLAGS= 

P_TARGET = $(PRVDIR)/tty_port
P_SOURCES = $(wildcard $(SRCDIR)/*port.c)
P_CFLAGS = -fPIC -g -O3 -pedantic -Wall -Wextra -D_XOPEN_SOURCE=700
P_LDFLAGS= 

.PHONY: all clean

all: $(P_TARGET) $(N_TARGET)

$(P_TARGET): $(P_SOURCES) 
	mkdir -p $(PRVDIR)
	$(CC) $(P_CFLAGS) $(P_SOURCES) -o $@ $(P_LDFLAGS)
	
$(N_TARGET): $(N_SOURCES) 
	$(CC) $(N_FLAGS) $(N_SOURCES) -o $@ $(N_LDFLAGS)

clean:
	rm -f $(N_TARGET)
	rm -f $(P_TARGET)
