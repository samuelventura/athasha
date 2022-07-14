#target is ALWAYS Linux (qemu on host)
#run with:
# mix compile
# mix clean

SRCDIR = src
PRVDIR = priv
TARGET = $(PRVDIR)/tty
SOURCES = $(wildcard $(SRCDIR)/*.c) $(wildcard $(SRCDIR)/termbox/src/*.c)
FLAGS = -fPIC -g -O3 -pedantic -Wall -Wextra -D_XOPEN_SOURCE

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SOURCES)
	echo "CC" $(CC)
	mkdir -p $(PRVDIR)
	$(CC) $(FLAGS) -o $@ $(SOURCES)

clean:
	rm -f $(TARGET)
