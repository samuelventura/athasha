SRCDIR = src/termbox/src
TARGET = $(SRCDIR)/termbox.a
SOURCES = $(wildcard $(SRCDIR)/*.c)
OBJECTS = $(SOURCES:.c=.o)
CFLAGS = -fPIC -D_XOPEN_SOURCE

.PHONY: all clean

$(TARGET): $(OBJECTS)
	$(AR) -r -o $@ $(OBJECTS)

clean:
	rm -f $(OBJECTS)
	rm -f $(TARGET)
