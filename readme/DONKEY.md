# Athasha on DonkeyPi

Stopped. A new phoenix app failed to install. It depends heavily in config/runtime.exs

esbuild is a pain.

Next step is to use releases to leave elixir the job to prune dev time tools and add config hooks.

```bash
cd dpi_ws
git clone https://github.com/samuelventura/athasha
cd athasha
cd backend
rm -fr deps/ _build/
mix dpi deps.get
mix dpi.select cpi3
mix dpi.install
mix dpi.log

```


Starting app athasha
Running app /data/dpi_apps/athasha
Found /data/dpi_apps/athasha.tgz
Extracting to /data/dpi_apps/athasha.lib
%MatchError{term: {:error, {'../../../../deps/cowboy/ebin', :unsafe_symlink}}} [{Dpi.Runtime.Runner, :run, 3, [file: 'lib/runner.ex', line: 86]}, {Dpi.Runtime.Runner, :start, 3, [file: 'lib/runner.ex', line: 24]}]

- Development

--app : Could not start application esbuild: could not find application file: esbuild.app
Application exited with code 1

- Production 

--app : Could not start application ssl: could not find application file: ssl.app
Application exited with code 1

--app : Could not start application syntax_tools: could not find application file: syntax_tools.app
Application exited with code 1

--app : Could not start application cowlib: could not find application file: cowlib.app
Application exited with code 1

--app : Could not start application xmerl: could not find application file: xmerl.app
Application exited with code 1

18:46:29.496 [error] `inotify-tools` is needed to run `file_system` for your system, check https://github.com/rvoicilas/inotify-tools/wiki for more information about how to install it. If it's already installed but not be found, appoint executable file with `config.exs` or `FILESYSTEM_FSINOTIFY_EXECUTABLE_FILE` env.

18:46:29.496 [warning] Could not start Phoenix live-reload because we cannot listen to the file system.
You don't need to worry! This is an optional feature used during development to
refresh your browser when you save files and it does not affect production.

13:01:11.576 [notice] Application esbuild exited: exited in: Esbuild.start(:normal, [])
    ** (EXIT) exited in: GenServer.call(Mix.ProjectStack, {:get_stack, #Function<13.26170436/1 in Mix.ProjectStack.peek/0>}, :infinity)
        ** (EXIT) no process: the process is not alive or there's no process currently associated with the given name, possibly because its application isn't started

