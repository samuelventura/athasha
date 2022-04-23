# Erlang/OTP/Elixir/Nerves Lessons

- NIFs are not autoclosed on normal exit
  - Baud in Athasha modbus runner keeps serial port open until a reraise was added on rescue handler. To reproduce, unplug the usb adapter while already connected.
  - Sniff tests for auto close on normal exit but this is a different case than presented in Athasha. In sniff code the process creating the NIF exits normally by returning from the spawned function, in Athasha code, the runner process creates the linked process holding the NIF and then the runner process exits normally which sends an exit signal to the NIF holding process with reason normal. In this case the NIF won't close (because its holding process won't exit itself) unless the exit signal is other than normal. This matches expected behavior documented in the [reference manual](https://www.erlang.org/doc/reference_manual/processes.html).
- According to the [reference manual](https://www.erlang.org/doc/reference_manual/processes.html), exit signals with normal reason from linked processes are dropped.
