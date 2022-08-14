# https://hexdocs.pm/nerves/environment-variables.html
# run with:
#  mix compile
#  mix clean

SRCDIR = src
DSTDIR = priv/native
UNAME := $(shell uname -s)
MIX_TARGET ?= host

C_CFLAGS = -g -O3 -Werror -pedantic -Wall -Wextra -D_XOPEN_SOURCE=700
C_LDFLAGS = -fPIC

CH_TARGET = $(DSTDIR)/tty_chvt
CH_SOURCES = $(SRCDIR)/tty_chvt.c
CH_CFLAGS = $(C_CFLAGS)
CH_LDFLAGS= $(C_LDFLAGS)

SLV_TARGET = $(DSTDIR)/tty_slave
SLV_SOURCES = $(SRCDIR)/tty_slave.c
SLV_CFLAGS = $(C_CFLAGS)
SLV_LDFLAGS= $(C_LDFLAGS)

ifeq ($(MIX_TARGET),host)
ifeq ($(UNAME),Darwin)
SLV_CFLAGS += -D_DARWIN_C_SOURCE
MTR_CFLAGS += -D_DARWIN_C_SOURCE
CH_CFLAGS += -D_DARWIN_C_SOURCE
endif
endif

.PHONY: all clean

all: $(CH_TARGET) $(SLV_TARGET) $(MTR_TARGET)

$(DSTDIR):
	mkdir -p $(DSTDIR)

$(SLV_TARGET): $(DSTDIR) $(SLV_SOURCES) 
	$(CC) $(SLV_CFLAGS) $(SLV_SOURCES) -o $@ $(SLV_LDFLAGS)

$(CH_TARGET): $(DSTDIR) $(CH_SOURCES) 
	$(CC) $(CH_CFLAGS) $(CH_SOURCES) -o $@ $(CH_LDFLAGS)
	
clean:
	rm -fR $(DSTDIR)
