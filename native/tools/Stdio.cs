namespace SharpTools;

public class Stdio
{
    public static byte[] Read(Stream stdin)
    {
        var head = new byte[2];
        var read = stdin.Read(head, 0, head.Length);
        if (read == 0) return null;
        var len = ((head[0] << 8) | (head[1] << 0));
        var data = new byte[len];
        read = stdin.Read(data, 0, data.Length);
        if (read == 0) return null;
        if (read != len) throw new Exception("Read mismatch");
        return data;
    }

    public static void Write(Stream stdout, byte[] bytes)
    {
        var head = new byte[2];
        var len = bytes.Length;
        head[0] = (byte)((len >> 8) & 0xff);
        head[1] = (byte)((len >> 0) & 0xff);
        stdout.Write(head, 0, head.Length);
        stdout.Write(bytes, 0, bytes.Length);
    }
}
