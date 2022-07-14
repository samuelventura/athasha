#target is ALWAYS Linux (qemu on host)
#run with:
# mix compile
# mix clean

SRCDIR = src
PRVDIR = priv
TARGET = $(PRVDIR)/tty
SOURCES = $(wildcard $(SRCDIR)/*.c) 
CFLAGS = -fPIC -g -O3 -pedantic -Wall -Wextra 
LCFLAGS= -L$(SRCDIR)/termbox/src -l:termbox.a

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SOURCES)
	echo "CC" $(CC)
	mkdir -p $(PRVDIR)
	make -f Termbox.mk
	$(CC) $(CFLAGS) $(SOURCES) -o $@ $(LCFLAGS)

clean:
	make clean -f Termbox.mk
	rm -f $(TARGET)
