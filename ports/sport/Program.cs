using System;
using System.IO.Ports;
using System.Text.Json;
using SharpTools;
CatchAll.Setup((e) =>
{
    Console.Error.WriteLine("{0}", e);
    Environment.Exit(1);
});
var tty = args[0];
var speed = args[1];
var config = args[2];
using (var port = new SerialPort())
{
    port.PortName = tty;
    port.BaudRate = Convert.ToInt32(speed);
    port.DataBits = Convert.ToInt32(config[0].ToString());
    switch (config[1])
    {
        case 'N':
            port.Parity = Parity.None;
            break;
        case 'E':
            port.Parity = Parity.Even;
            break;
        case 'O':
            port.Parity = Parity.Odd;
            break;
    }
    switch (config[2])
    {
        case '1':
            port.StopBits = StopBits.One;
            break;
        case '2':
            port.StopBits = StopBits.Two;
            break;
    }
    port.Open();
    using (var stdin = Console.OpenStandardInput())
    {
        using (var stdout = Console.OpenStandardOutput())
        {
            while (true)
            {

                var head = new byte[2];
                var read = stdin.Read(head, 0, head.Length);
                if (read == 0) return;
                var len = ((head[0] << 8) | (head[1] << 0));
                var data = new byte[len];
                read = stdin.Read(data, 0, data.Length);
                if (read == 0) return;
                if (read != len) throw new Exception("Read mismatch");
                var cmd = (char)data[0];
                switch (cmd)
                {
                    case 'r':
                        {
                            len = port.BytesToRead;
                            var bytes = new byte[len + 2];
                            bytes[0] = (byte)((len >> 8) & 0xff);
                            bytes[1] = (byte)((len >> 0) & 0xff);
                            if (len > 0)
                            {
                                read = port.Read(bytes, 2, len);
                                if (read == 0) throw new Exception("Zero read");
                                if (read != len) throw new Exception("Read mismatch");
                            }
                            stdout.Write(bytes, 0, bytes.Length);
                            break;
                        }
                    case 'w':
                        {
                            if (data.Length > 1)
                            {
                                port.Write(data, 1, data.Length - 1);
                            }
                            break;
                        }
                    case 'm': // master request/response
                        {
                            len = ((data[1] << 8) | (data[2] << 0));
                            port.DiscardInBuffer();
                            port.DiscardOutBuffer();
                            if (data.Length > 3)
                            {
                                port.Write(data, 3, data.Length - 3);
                            }
                            var count = 0;
                            var bytes = new byte[len + 2];
                            bytes[0] = data[1];
                            bytes[1] = data[2];
                            while (count < len)
                            {
                                read = port.Read(bytes, 2 + count, len - count);
                                if (read == 0) throw new Exception("Zero read");
                                count += read;
                            }
                            stdout.Write(bytes, 0, bytes.Length);
                            break;
                        }
                    case 's': // slave request scan
                        {
                            //async to ensure slave port exits when stdin closes
                            Task.Run(() =>
                            {
                                var first = port.ReadByte();
                                if (first == -1) throw new Exception("Zero read");
                                //https://modbus.org/docs/Modbus_over_serial_line_V1_02.pdf
                                //page 11 9600 -> 4ms let's see how reliable BytesToRead is
                                var bauds = port.BaudRate;
                                var icto = (int)Math.Ceiling(bauds > 19200 ? 1.75 : 3.5 * 10000 / bauds);
                                //Console.Error.WriteLine("{0} {1} {2}", tty, speed, icto);
                                var count = 0;
                                do
                                {
                                    count = port.BytesToRead;
                                    Thread.Sleep(icto);
                                }
                                while (port.BytesToRead > count);
                                var len = port.BytesToRead + 1;
                                var bytes = new byte[len + 2];
                                bytes[0] = (byte)((len >> 8) & 0xff);
                                bytes[1] = (byte)((len >> 0) & 0xff);
                                bytes[2] = (byte)first;
                                if (len > 0)
                                {
                                    read = port.Read(bytes, 3, len - 1);
                                    if (read == 0) throw new Exception("Zero read");
                                    if (read != len - 1) throw new Exception("Read mismatch");
                                }
                                stdout.Write(bytes, 0, bytes.Length);
                            });
                            break;
                        }
                    default:
                        throw new Exception("Unknown command");
                }
            }
        }
    }
}
