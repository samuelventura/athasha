using System.Text;
namespace SharpTools;

public class Stdio
{
    protected Stream stdin;
    protected Stream stdout;
    public virtual byte[] Read() { return null; }

    public virtual void Write(byte[] bytes) { }

    public virtual string ReadString()
    {
        var data = Read();
        if (data == null) return null;
        return Encoding.UTF8.GetString(data);
    }

    public virtual void WriteString(string text)
    {
        Write(Encoding.UTF8.GetBytes(text));
    }

    public class H2 : Stdio
    {
        public H2(Stream stdin, Stream stdout)
        {
            this.stdin = stdin;
            this.stdout = stdout;
        }
        public override byte[] Read()
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

        public override void Write(byte[] bytes)
        {
            var head = new byte[2];
            var len = bytes.Length;
            head[0] = (byte)((len >> 8) & 0xff);
            head[1] = (byte)((len >> 0) & 0xff);
            stdout.Write(head, 0, head.Length);
            stdout.Write(bytes, 0, bytes.Length);
        }
    }

    public class H4 : Stdio
    {
        public H4(Stream stdin, Stream stdout)
        {
            this.stdin = stdin;
            this.stdout = stdout;
        }
        public override byte[] Read()
        {
            var head = new byte[4];
            var read = stdin.Read(head, 0, head.Length);
            if (read == 0) return null;
            var len = ((head[0] << 24) | (head[1] << 16) | (head[2] << 8) | (head[3] << 0));
            var data = new byte[len];
            read = stdin.Read(data, 0, data.Length);
            if (read == 0) return null;
            if (read != len) throw new Exception("Read mismatch");
            return data;
        }

        public override void Write(byte[] bytes)
        {
            var head = new byte[4];
            var len = bytes.Length;
            head[0] = (byte)((len >> 24) & 0xff);
            head[1] = (byte)((len >> 16) & 0xff);
            head[2] = (byte)((len >> 8) & 0xff);
            head[3] = (byte)((len >> 0) & 0xff);
            stdout.Write(head, 0, head.Length);
            stdout.Write(bytes, 0, bytes.Length);
        }
    }
}
