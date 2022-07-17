#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <ctype.h>
#include <errno.h>
#include <sys/time.h>
#include "port.h"

#define UNUSED(x) (void)(x)

void print_time(const char *tail) {
  struct timeval now;
  int pid = getpid();
  int rv = gettimeofday(&now, NULL);
  if (rv < 0) exit(-2);
  fprintf(stderr, "%d %d.%03d%s", pid, (int)(now.tv_sec%1000),
    (int)(now.tv_usec/1000), tail);
}

void debug(const char* fmt, ...) {
#ifdef PORT_DEBUG
  va_list ap;
  va_start(ap, fmt);
  print_time(" ");
  vfprintf(stderr, fmt, ap);
  fprintf(stderr, "\r\n");
  fflush(stderr);
#else
  UNUSED(fmt);  
#endif
}

void crash(const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);
  print_time(" ");
  fprintf(stderr, "crash: ");
  vfprintf(stderr, fmt, ap);
  fprintf(stderr, "\r\n");
  print_time(" ");
  fprintf(stderr, "error: %d %s", errno, strerror(errno));
  fprintf(stderr, "\r\n");
  fflush(stderr);
  exit(-1);
  abort(); //force crash
}

void phex(const char *header, unsigned char *buf, int size) {
#ifdef PORT_DEBUG
    print_time(" ");
    fprintf(stderr, "%s", header);
    for (int i = 0; i < size; i++) {
        fprintf(stderr, "%02X", buf[i]);
    }
    fprintf(stderr, "\r\n");
#else
  UNUSED(header);
  UNUSED(buf);
  UNUSED(size);
#endif
}

int stdin_read(unsigned char* buffer, int size) {
  int ic = read(STDIN_FILENO, buffer, size);
  if (ic <= 0) return ic;
  phex("sir>", buffer, ic);
  return ic;
}

int stdout_write(unsigned char* buffer, int size) {
  phex("sow<", buffer, size);
  return write(STDOUT_FILENO, buffer, size);
}

int stdin_read_packet(unsigned char* buffer, int size) {
  unsigned char header[2];
  int ic = stdin_read(header, 2);
  if (ic <= 0) return ic;
  if (ic != 2) crash("Partial packet size from stdin %d", ic);
  int is = header[0]<<8 | header[1];
  if (is > size) crash("Packet larger than buffer size packet:%d buffer:%d", is, size);
  ic = stdin_read(buffer, is);
  if (ic <= 0) return ic;
  if (is != ic) crash("Partial read from stdin expected:%d read:%d", is, ic);
  return is;
}

void stdout_write_packet(unsigned char* buffer, int size) {
  unsigned char header[2];
  header[0] = (size>>8)&0xff; header[1] = size&0xff;
  int oc = stdout_write(header, 2);
  if (2 != oc) crash("Partial header write to stdout expected:%d written:%d", 2, oc);
  oc = stdout_write(buffer, size);
  if (size != oc) crash("Partial write to stdout expected:%d written:%d", size, oc);
}

char read_char(struct CMD* cmd) {
  int start = cmd->position;
  if(cmd->position < cmd->length) {
    return cmd->buffer[cmd->position++];
  }
  crash("read_char failed at index %d", start);
  return 0;
}

int read_digit(struct CMD* cmd) {
  int start = cmd->position;
  if(cmd->position < cmd->length) {
    char c = cmd->buffer[cmd->position++];
    if (isdigit(c)) return c - '0';
  }
  crash("read_digit failed at index %d", start);
  return 0;
}

//should consume only digits and leave non digits untouch
unsigned int read_uint(struct CMD* cmd) {
  char buf[32];
  unsigned int count = 0;
  while(cmd->position < cmd->length && count < sizeof(buf) - 1) {
    char c = cmd->buffer[cmd->position];
    if (isdigit(c)) { buf[count] = c; buf[count+1] = 0; count++; cmd->position++; }
    else break;
  }
  if (count > 0) return atoi(buf);
  crash("read_uint failed at index %d", cmd->position);
  return 0;
}

void read_str_n(struct CMD* cmd, int width, char* buffer, char bufsize) {
  for(int i=0; i<width; i++) {
    char c = read_char(cmd);
    if (i < bufsize - 1) { buffer[i] = c; buffer[i+1] = 0; }
    else crash("read_str_n up to '%d' failed at index %d", width, i);
  }
}

//should consume the delimiter but not return it
void read_str_c(struct CMD* cmd, char delimiter, char* buffer, char bufsize) {
  for(int i=0; ; i++) {
    char c = read_char(cmd);
    if (c == delimiter && i < bufsize) { buffer[i] = 0; return; }
    else if (c != delimiter && i < bufsize - 1) { buffer[i] = c; buffer[i+1] = 0; }
    else crash("read_str_c up to '%c' failed at index %d", delimiter, i);
  }
}

void read_loop(int argc, char *argv[], int (*callback)(struct CMD*)) {
  for(int i=1; i<argc; i++) {
    struct CMD cmd;
    char* buffer = argv[1];
    cmd.buffer = buffer;
    cmd.length = strlen(buffer);
    cmd.position = 0;
    debug(">%s", buffer);
    int r = callback(&cmd);
    if (r) return;
  }
  while(1) {
    unsigned char buffer[256];
    int ic = stdin_read_packet(buffer, sizeof(buffer) - 1);
    if (ic <= 0) return;
    buffer[ic] = 0;
    struct CMD cmd;
    cmd.buffer = (char*)buffer;
    cmd.length = ic;
    cmd.position = 0;
    debug(">%s", buffer);
    int r = callback(&cmd);
    if (r) return;
  }
}
