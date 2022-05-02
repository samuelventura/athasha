using System.IO.Ports;
using System.Text.Json;
using SharpTools;

CatchAll.Setup((e) => {
    Console.Error.WriteLine("{0}", e);
    Environment.Exit(1);
});
var json = Console.ReadLine();
var config = JsonSerializer.Deserialize<Config>(json);
var port = new SerialPort();
port.PortName = config.tty;
port.BaudRate = Convert.ToInt32(config.speed);     
port.DataBits = Convert.ToInt32(config.dbpsb[0]);     
switch(config.dbpsb[1]) {
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
switch(config.dbpsb[2]) {
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
while(true) {
    json = Console.ReadLine();
    var req = JsonSerializer.Deserialize<Request>(json);
    port.DiscardInBuffer();
    port.DiscardOutBuffer();
    var reqb = Convert.FromBase64String(req.data);
    port.Write(reqb, 0, reqb.Length);
    var resb = new byte[req.resp];
    var count = 0;
    while (count < reqb.Length) {
        count += port.Read(resb, count, resb.Length - count);
    }
    var res = Convert.ToBase64String(resb);
    Console.WriteLine(res);
}

class Config {
    public string tty {get; set; }
    public string speed {get; set; }
    public string dbpsb {get; set; }
}

class Request {
    public string data {get; set; }
    public int resp {get; set; }
}