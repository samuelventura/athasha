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
var port = new SerialPort();
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
port.ReadTimeout = 1000;
port.WriteTimeout = 1000;
port.Open();
using (var stdin = Console.OpenStandardInput())
{
    using (var stdout = Console.OpenStandardOutput())
    {
        while (true)
        {

            var head = new byte[2];
            var read = stdin.Read(head, 0, head.Length);
            if (read == 0) Environment.Exit(0);
            var len = ((head[0] << 8) | (head[1] << 0));
            var data = new byte[len];
            read = stdin.Read(data, 0, data.Length);
            if (read == 0) Environment.Exit(0);
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
                        read = port.Read(bytes, 2, len);
                        if (read != len) throw new Exception("Read mismatch");
                        stdout.Write(bytes, 0, bytes.Length);
                        break;
                    }
                case 'w':
                    {
                        port.DiscardInBuffer();
                        port.DiscardOutBuffer();
                        if (data.Length > 1)
                        {
                            port.Write(data, 1, data.Length - 1);
                        }
                        break;
                    }
                default:
                    throw new Exception("Unknown command");
            }
        }
    }
}
