# NWNLauncher-Backend
The nodejs-based sister project of [NWNLauncher](https://github.com/tzaeru/NWNLauncher).

If you intend to use this, please install and configure NWNLauncher first. NWNLauncher does not depend on this backend. NWNLauncher can use any file service that serves the appropriate files! If you know your stuff, you might as well run a generic file server.

NWNLauncher-Backend is a convenience project and is meant for future extensions such as players uploading their character portraits etc.

## Basic what & how?

NWNLauncher-Backend servers a file in TOML format (usually files.toml, but this can be configured in NWNLauncher) that describes the dependencies that NWNLauncher should fetch in order to succesfully join a server.

This project combines both serving that main TOML configuration, the required files, and automatic creation of the TOML configuration.

## Installing & running

[Install NodeJS](https://nodejs.org/en/)

Clone/download the repository and move to it (```git clone https://github.com/tzaeru/NWNLauncher-Backend``` and ```cd NWNLauncher-Backend```)

```npm install``` to install the prerequisites.

```nodemon app.js``` to start the server.

## File serving format

NWNLauncher-Backend is a very generic purpose file service. It adds simple version management and a few utility scripts. Look at [files_slim.toml](https://github.com/tzaeru/NWNLauncher-Backend/blob/master/files/files_slim.toml) for an example of what kind of data the backend service passes on to clients. Here's a short summary of the fields:

```server_ip```: the IP to which the client will try to connect to join a server.

```name```: not currently used. It's there for convenience.
```version```: when the version number for a file is increased, clients will redownload that file.
```url```: the url to append to root service url for the file. For example, if the client NWNLauncher has an address configured as "myserver.com/nwn", then an address to a file might be "myserver.com/nwn/talk.tlk".
```target_dir```: the directory under NWN's root directory to which the client will install the file.
```target_file```: the target file name with which the client will save the file.
```checksum```: a simple md5 checksum for the file contents to verify sanity.

## Generating files.toml

[files/file_list_generator.js](https://github.com/tzaeru/NWNLauncher-Backend/blob/master/files/file_list_generator.js) can be used to generate a files.toml listing. It will look into directories ```hak, erf, tlk, dmvault, portraits, override and music``` and create a version 1 entry for each file it finds. Place your haks, erfs, tlks etc to these directories. To add directories, put them under the sequence of "walk_directory" function calls.

If ```file_list_generator``` finds files ending in .tar.gz, it will prioritize those over the base files. So you can have both my_hak.hak and my_hak.hak.tar.gz in the hak directory, and only my_hak.hak.tar.gz will be used.

You can run it with ```node file_list_generator.js```
