using System;
using System.IO.Ports;
using SharpTools;
var catcher = (Exception ex) =>
{
    Console.Error.WriteLine("{0}", ex);
    Environment.Exit(1);
};
Global.Catch(catcher);
var runner = (Action action) =>
{
    Task.Run(() =>
    {
        try { action(); }
        catch (Exception ex) { catcher(ex); }
    });
};
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

            var stdio = new Stdio.H2(stdin, stdout);
            while (true)
            {
                var data = stdio.Read();
                if (data == null) return;
                var cmd = (char)data[0];
                switch (cmd)
                {
                    case 'r':
                        {
                            var len = port.BytesToRead;
                            var bytes = new byte[len];
                            if (len > 0)
                            {
                                var read = port.Read(bytes, 0, len);
                                if (read == 0) throw new Exception("Zero read");
                                if (read != len) throw new Exception("Read mismatch");
                            }
                            stdio.Write(bytes);
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
                            //async to ensure a partial response won't zombie this process
                            runner(() =>
                            {
                                var len = ((data[1] << 8) | (data[2] << 0));
                                port.DiscardInBuffer();
                                port.DiscardOutBuffer();
                                if (data.Length > 3)
                                {
                                    port.Write(data, 3, data.Length - 3);
                                }
                                var count = 0;
                                var bytes = new byte[len];
                                while (count < len)
                                {
                                    var read = port.Read(bytes, count, len - count);
                                    if (read == 0) throw new Exception("Zero read");
                                    count += read;
                                }
                                stdio.Write(bytes);
                            });
                            break;
                        }
                    case 's': // slave request scan
                        {
                            //async to ensure slave port exits when stdin closes
                            runner(() =>
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
                                var bytes = new byte[len];
                                bytes[0] = (byte)first;
                                if (len > 0)
                                {
                                    var read = port.Read(bytes, 1, len - 1);
                                    if (read == 0) throw new Exception("Zero read");
                                    if (read != len - 1) throw new Exception("Read mismatch");
                                }
                                stdio.Write(bytes);
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
