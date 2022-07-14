#ifndef _PORT_H_
#define _PORT_H_

#define debug_enabled 1

struct CMD {
  char* buffer;
  int length;
  int position;
};

int read_loop(int argc, char *argv[], void (*callback)(struct CMD*));

void stdout_write_packet(unsigned char* buffer, int size);

char read_char(struct CMD* cmd);
int read_digit(struct CMD* cmd);
unsigned int read_uint(struct CMD* cmd);
void read_str_n(struct CMD* cmd, int width, char* buffer, char bufsize);
void read_str_c(struct CMD* cmd, char delimiter, char* buffer, char bufsize);

void debug(const char* fmt, ...);
void crash(const char* fmt, ...);

#endif
