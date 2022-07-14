#target is ALWAYS Linux (qemu on host)
#run with:
# mix compile
# mix clean

SRCDIR = src
PRVDIR = priv
SOURCES = $(SRCDIR)/svt.c
TARGET = $(PRVDIR)/svt.so
FLAGS = -fPIC -I$(ERTS_INCLUDE_DIR) -shared -g -O3 -ansi -pedantic -Wall -Wextra

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SOURCES)
	echo "CC" $(CC)
	mkdir -p $(PRVDIR)
	$(CC) $(FLAGS) -o $@ $<

clean:
	rm -f $(TARGET)
