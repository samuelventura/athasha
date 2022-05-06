using System.Security.AccessControl;
using SharpTools;

Global.Catch((ex) =>
{
    Console.Error.WriteLine("{0}", ex);
    Environment.Exit(1);
});

if (OperatingSystem.IsWindows())
{
    var srcFolder = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
    var desFolder = args[0];

    // Step 1: Use the GetAccessControl method to retrieve the
    // DirectorySecurity object from the source file.
    var srcPermissions = new DirectoryInfo(srcFolder).GetAccessControl();

    // Step 2: Create a new DirectorySecurity object for the destination file.
    var desPermissions = new DirectorySecurity();


    // Step 3: Use the GetSecurityDescriptorBinaryForm method of the
    // source DirectorySecurity object to retrieve the ACL information.
    var securityDescriptor = srcPermissions.GetSecurityDescriptorBinaryForm();

    // Step 4: Use the SetSecurityDescriptorBinaryForm method to copy the
    // information retrieved in step 3 to the destination
    // DirectorySecurity object.
    desPermissions.SetSecurityDescriptorBinaryForm(securityDescriptor);

    // Step 5: Set the destination DirectorySecurity object to the
    // destination file using the SetAccessControl method.
    new DirectoryInfo(desFolder).SetAccessControl(desPermissions);
}
