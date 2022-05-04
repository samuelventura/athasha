using DeviceId;
using SharpTools;

Global.Catch((Exception ex) =>
{
    Console.Error.WriteLine("{0}", ex);
    Environment.Exit(1);
});

string deviceId = new DeviceIdBuilder()
    .AddMachineName()
    .AddOsVersion()
    .OnWindows(windows => windows
        .AddProcessorId()
        .AddMotherboardSerialNumber()
        .AddSystemDriveSerialNumber())
    .OnLinux(linux => linux
        .AddMotherboardSerialNumber()
        .AddSystemDriveSerialNumber())
    .OnMac(mac => mac
        .AddSystemDriveSerialNumber()
        .AddPlatformSerialNumber())
    .ToString();

Console.WriteLine(deviceId);
