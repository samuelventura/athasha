; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!
; https://www.mirality.co.nz/inno/tips.php

#define MyAppId "Athasha" 
#define MyAppName "Athasha"
#define MyAppVersion "0.2.8"
#define MyAppPublisher "athasha.io"
#define MyAppURL "https://athasha.io"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppCopyright=Copyright (C) 2022 {#MyAppPublisher}
AppId={{A0BF8CB6-359A-4764-BD9A-4AAC09CCEA27}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
; DefaultDirName={commonpf}\{#MyAppName}
; DefaultDirName={commonpf64}\{#MyAppName}
DefaultDirName=C:\{#MyAppName}
DisableDirPage=true
DisableReadyMemo=yes
DisableReadyPage=yes
DisableFinishedPage=yes
DisableStartupPrompt=yes
DisableProgramGroupPage=yes
DefaultGroupName={#MyAppName}
OutputBaseFilename={#MyAppId}-{#MyAppVersion}
SetupIconFile=setup\athasha.ico
Compression=lzma
SolidCompression=yes
UninstallDisplayIcon={uninstallexe}
ChangesAssociations = yes
OutputDir=setup

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "backend\_build\prod\rel\athasha\*.*"; DestDir: "{app}\athasha"; Flags: ignoreversion recursesubdirs         
Source: "setup\*.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "setup\*.ico"; DestDir: "{app}"; Flags: ignoreversion
; 16x16, 32x32, 48x48, 64x64, and 256x256 (image magic convert)
; NOTE: Don't use "Flags: ignoreversion" on any shared system files
                                                
[Icons]
Name: "{group}\{#MyAppName}"; Filename: "http://127.0.0.1:54321"; IconFilename: "{app}\athasha.ico"
Name: "{commondesktop}\{#MyAppName}"; Filename: "http://127.0.0.1:54321"; IconFilename: "{app}\athasha.ico"
Name: "{group}\Password"; Filename: "{app}\Password.bat"; IconFilename: "{app}\password.ico"; \
  AfterInstall: SetElevationBit('{group}\Password.lnk')
;Version in icon leaves previous link when upgrading

[Run]
Filename: "{app}\PostInstall.bat";

[UninstallRun]
Filename: "{app}\PreUninstall.bat"; RunOnceId: "PreUninstall";

[Code]
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: integer;
begin
  Exec(ExpandConstant('{app}\PreUninstall.bat'), '', '', SW_SHOW, ewWaitUntilTerminated, ResultCode)
end;

procedure SetElevationBit(Filename: string);
var
  Buffer: string;
  Stream: TStream;
begin
  Filename := ExpandConstant(Filename);
  Log('Setting elevation bit for ' + Filename);

  Stream := TFileStream.Create(FileName, fmOpenReadWrite);
  try
    Stream.Seek(21, soFromBeginning);
    SetLength(Buffer, 1);
    Stream.ReadBuffer(Buffer, 1);
    Buffer[1] := Chr(Ord(Buffer[1]) or $20);
    Stream.Seek(-1, soFromCurrent);
    Stream.WriteBuffer(Buffer, 1);
  finally
    Stream.Free;
  end;
end;