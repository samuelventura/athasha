
```bash
% brew install --cask dotnet-sdk
% dotnet --version
6.0.202
% dotnet --info | grep RID
 RID:         ubuntu.20.04-x64


#https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu
#snap version has no globalization ICU libs
wget https://packages.microsoft.com/config/ubuntu/21.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-6.0

#Server=10.77.3.211;Database=datalog;User Id=sa;Password=123;Encrypt=false;Connection Timeout=5;
#Server=10.77.3.211;Database=datalog;User Id=sa;Password=123;TrustServerCertificate=True;Connection Timeout=5;

#insert into dbo.Table1 (COL1) values (@1)
```
